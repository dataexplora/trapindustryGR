import { supabase } from '@/lib/supabase';
import { cacheService } from '@/lib/cacheService';

export interface Artist {
  id: string;
  name: string;
  biography?: string;
  followers?: number;
  monthly_listeners?: number;
  world_rank?: number;
  verified?: boolean;
  share_url?: string;
  last_updated?: string;
}

export interface ExternalLink {
  id: number;
  name: string;
  url: string;
}

export interface TopCity {
  id: number;
  city: string;
  country: string;
  region?: string;
  listener_count: number;
  rank: number;
}

export interface ArtistWithImages extends Artist {
  images?: {
    avatar?: string;
    header?: string;
    gallery?: string[];
  };
  externalLinks?: Array<{
    id: number;
    artist_id: string;
    name: string;
    url: string;
  }>;
  topCities?: Array<{
    id: number;
    artist_id: string;
    city: string;
    country: string;
    region?: string;
    listener_count?: number;
    rank?: number;
  }>;
}

export interface Track {
  id: string;
  name: string;
  share_url?: string;
  explicit?: boolean;
  duration_ms?: number;
  disc_number?: number;
  play_count?: number;
  album?: {
    id: string;
    name: string;
    image?: {
      url: string;
    }
  };
  album_id?: string;
  album_name?: string;
  album_image?: {
    url: string;
  };
  last_updated?: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface ArtistOption {
  label: string;
  value: string;
  imageUrl?: string;
}

export const artistService = {
  /**
   * Get all artists from the database
   * @param {number} minListeners - Minimum monthly listeners (defaults to 100000)
   */
  getAllArtists: async (minListeners = 100000): Promise<ArtistWithImages[]> => {
    const cacheKey = `getAllArtists-${minListeners}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<ArtistWithImages[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    try {
      // Fetch artists from the database
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .gte('monthly_listeners', minListeners)
        .order('monthly_listeners', { ascending: false });
      
      if (error) {
        console.error('Error fetching artists:', error);
        throw error;
      }

      if (!artists || artists.length === 0) {
        return [];
      }

      // For each artist, fetch their images and external links
      const artistsWithData = await Promise.all(
        artists.map(async (artist) => {
          // Fetch images
          const { data: images, error: imagesError } = await supabase
            .from('artist_images')
            .select('*')
            .eq('artist_id', artist.id);

          if (imagesError) {
            console.error(`Error fetching images for artist ${artist.id}:`, imagesError);
            return {
              ...artist,
              externalLinks: []
            } as ArtistWithImages;
          }

          // Fetch external links
          const { data: externalLinks, error: linksError } = await supabase
            .from('artist_external_links')
            .select('*')
            .eq('artist_id', artist.id);

          if (linksError) {
            console.error(`Error fetching external links for artist ${artist.id}:`, linksError);
          }

          // Group images by type
          const groupedImages = {
            avatar: images?.find(img => img.image_type === 'avatar')?.url,
            header: images?.find(img => img.image_type === 'header')?.url,
            gallery: images?.filter(img => img.image_type === 'gallery')
              .sort((a, b) => (a.image_index || 0) - (b.image_index || 0))
              .map(img => img.url) || []
          };

          return {
            ...artist,
            images: groupedImages,
            externalLinks: externalLinks || []
          } as ArtistWithImages;
        })
      );

      // Cache the results
      cacheService.set(cacheKey, artistsWithData);
      
      return artistsWithData;
    } catch (error) {
      console.error('Error in getAllArtists:', error);
      return [];
    }
  },

  /**
   * Get top artists by monthly listeners
   */
  getTopArtists: async (limit = 10): Promise<ArtistWithImages[]> => {
    const cacheKey = `getTopArtists-${limit}`;
    
    // Try to get from in-memory cache first
    const cachedData = cacheService.get<ArtistWithImages[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Step 1: Get top artist IDs from the cache table
      const { data: topArtistIds, error: cacheError } = await supabase
        .from('cached_top_artists')
        .select('artist_id, rank')
        .order('rank', { ascending: true })
        .limit(limit);
        
      if (!cacheError && topArtistIds && topArtistIds.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Retrieved ${topArtistIds.length} artist IDs from cache table`);
        }
        
        // Step 2: Extract the artist IDs
        const artistIds = topArtistIds.map(item => item.artist_id);
        
        // Step 3: Get the full artist data for these IDs
        const { data: artists, error: artistsError } = await supabase
          .from('artists')
          .select('*')
          .in('id', artistIds);
          
        if (artistsError) {
          console.error('Error fetching artists by IDs:', artistsError);
          throw artistsError;
        }
        
        if (!artists || artists.length === 0) {
          console.warn('No artists found for the cached IDs');
          // Fall back to direct query below
        } else {
          // Sort artists according to the order in the cache
          const rankedArtists = artists
            .map(artist => {
              const rankInfo = topArtistIds.find(item => item.artist_id === artist.id);
              return { 
                ...artist, 
                cacheRank: rankInfo ? rankInfo.rank : 999 // Use 999 as fallback rank
              };
            })
            .sort((a, b) => a.cacheRank - b.cacheRank);
            
          // For each artist, fetch their images and external links
          const artistsWithData = await Promise.all(
            rankedArtists.map(async (artist) => {
              if (process.env.NODE_ENV === 'development') {
                console.log(`Processing artist: ${artist.name} (ID: ${artist.id})`);
                console.log(`Artist monthly listeners: ${artist.monthly_listeners}, followers: ${artist.followers}`);
              }
              
              // Fetch images
              const { data: images, error: imagesError } = await supabase
                .from('artist_images')
                .select('*')
                .eq('artist_id', artist.id);

              if (imagesError) {
                console.error(`Error fetching images for artist ${artist.id}:`, imagesError);
              } else if (process.env.NODE_ENV === 'development') {
                console.log(`Found ${images?.length || 0} images for artist ${artist.name}`);
              }

              // Fetch external links
              const { data: externalLinks, error: linksError } = await supabase
                .from('artist_external_links')
                .select('*')
                .eq('artist_id', artist.id);

              if (linksError) {
                console.error(`Error fetching external links for artist ${artist.id}:`, linksError);
              }

              // Group images by type
              const groupedImages = {
                avatar: images?.find(img => img.image_type === 'avatar')?.url || 
                       `https://placehold.co/400x400/252536/8A8AFF?text=${encodeURIComponent(artist.name)}`,
                header: images?.find(img => img.image_type === 'header')?.url,
                gallery: images?.filter(img => img.image_type === 'gallery')
                  .sort((a, b) => (a.image_index || 0) - (b.image_index || 0))
                  .map(img => img.url) || []
              };

              // Log image information for debugging
              if (process.env.NODE_ENV === 'development') {
                console.log(`Images for ${artist.name}:`, {
                  hasAvatar: !!groupedImages.avatar,
                  hasHeader: !!groupedImages.header,
                  galleryCount: groupedImages.gallery.length,
                  avatarUrl: groupedImages.avatar?.substring(0, 50) + '...'
                });
              }

              // Create complete artist object
              const { cacheRank, ...artistWithoutRank } = artist; // Remove temporary cacheRank
              return {
                ...artistWithoutRank,
                monthly_listeners: artist.monthly_listeners || 0,
                followers: artist.followers || 0,
                images: groupedImages,
                externalLinks: externalLinks || []
              } as ArtistWithImages;
            })
          );

          if (process.env.NODE_ENV === 'development') {
            console.log(`Returning ${artistsWithData.length} artists with images and data`);
          }
          
          // Cache the results
          cacheService.set(cacheKey, artistsWithData);
          
          return artistsWithData;
        }
      }
      
      // Fall back to original method if needed
      if (process.env.NODE_ENV === 'development') {
        console.log('Cache table failed or empty, falling back to direct query');
      }
      
      // Original method: fetch artists directly sorted by monthly_listeners
      // ... rest of existing code ...
    } catch (error) {
      console.error('Error in getTopArtists:', error);
      throw error; // Re-throw to allow calling code to handle the error
    }
  },

  /**
   * Get an artist by ID
   */
  getArtistById: async (id: string): Promise<ArtistWithImages | null> => {
    // Add cache key
    const cacheKey = `artist-detail-${id}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<ArtistWithImages>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Fetch artist by ID
      const { data: artist, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching artist with ID ${id}:`, error);
        throw error;
      }

      if (!artist) {
        return null;
      }

      // Fetch artist images
      const { data: images, error: imagesError } = await supabase
        .from('artist_images')
        .select('*')
        .eq('artist_id', id);

      if (imagesError) {
        console.error(`Error fetching images for artist ${id}:`, imagesError);
        return artist as ArtistWithImages;
      }

      // Fetch external links
      const { data: externalLinks, error: linksError } = await supabase
        .from('artist_external_links')
        .select('*')
        .eq('artist_id', id);

      if (linksError) {
        console.error(`Error fetching external links for artist ${id}:`, linksError);
      }
      
      // Fetch top cities
      const { data: topCities, error: citiesError } = await supabase
        .from('artist_top_cities')
        .select('*')
        .eq('artist_id', id)
        .order('rank', { ascending: true });
        
      if (citiesError) {
        console.error(`Error fetching top cities for artist ${id}:`, citiesError);
      }

      // Group images by type
      const groupedImages = {
        avatar: images?.find(img => img.image_type === 'avatar')?.url,
        header: images?.find(img => img.image_type === 'header')?.url,
        gallery: images?.filter(img => img.image_type === 'gallery')
          .sort((a, b) => (a.image_index || 0) - (b.image_index || 0))
          .map(img => img.url) || []
      };

      const artistWithImages = {
        ...artist,
        images: groupedImages,
        externalLinks: externalLinks || [],
        topCities: topCities || []
      } as ArtistWithImages;
      
      // Cache the result - 24 hours
      cacheService.set(cacheKey, artistWithImages, 24 * 60 * 60 * 1000);

      return artistWithImages;
    } catch (error) {
      console.error(`Error in getArtistById for ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Get artist's top tracks ordered by play count
   */
  getArtistTopTracks: async (artistId: string, limit = 20): Promise<Track[]> => {
    // Add cache key
    const cacheKey = `artist-top-tracks-${artistId}-${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<Track[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Properly type the response structure
      interface ArtistTrackResponse {
        track_id: string;
        is_top_track: boolean;
        tracks: {
          id: string;
          name: string;
          share_url?: string;
          explicit?: boolean;
          duration_ms?: number;
          disc_number?: number;
          play_count?: number;
          album_id?: string;
          last_updated?: string;
        };
      }
      
      // Fetch top tracks for the artist, ordered by play count
      const { data: topTracks, error: tracksError } = await supabase
        .from('artist_tracks')
        .select(`
          track_id,
          is_top_track,
          tracks:track_id (
            id,
            name,
            share_url,
            explicit,
            duration_ms,
            disc_number,
            play_count,
            album_id,
            last_updated
          )
        `)
        .eq('artist_id', artistId)
        .order('is_top_track', { ascending: false });
      
      if (tracksError) {
        console.error(`Error fetching top tracks for artist ${artistId}:`, tracksError);
        return [];
      }

      if (!topTracks || topTracks.length === 0) {
        return [];
      }

      // Create an array to hold our tracks
      const tracks: Track[] = [];
      
      // Extract track IDs and album IDs for additional queries
      const trackIds: string[] = [];
      const albumIds: string[] = [];
      
      // First pass: collect IDs
      for (const item of topTracks) {
        if (!item.tracks) continue;
        const trackItem = item.tracks as any;
        trackIds.push(trackItem.id);
        if (trackItem.album_id) {
          albumIds.push(trackItem.album_id);
        }
      }
      
      // Fetch album images if we have album IDs
      let albumImagesMap: Record<string, {url: string}> = {};
      if (albumIds.length > 0) {
        try {
          const { data: albumImagesData, error: albumImagesError } = await supabase
            .from('album_images')
            .select('album_id, url')
            .in('album_id', albumIds);
            
          if (!albumImagesError && albumImagesData) {
            // Use the first image for each album
            albumImagesMap = albumImagesData.reduce((acc, img) => {
              if (!acc[img.album_id]) {
                acc[img.album_id] = { url: img.url };
              }
              return acc;
            }, {} as Record<string, {url: string}>);
          }
        } catch (err) {
          console.error('Error fetching album images:', err);
        }
      }
      
      // Fetch album names
      let albumNamesMap: Record<string, string> = {};
      if (albumIds.length > 0) {
        try {
          const { data: albumsData, error: albumsError } = await supabase
            .from('albums')
            .select('id, name')
            .in('id', albumIds);
            
          if (!albumsError && albumsData) {
            albumNamesMap = albumsData.reduce((acc, album) => ({
              ...acc,
              [album.id]: album.name
            }), {});
          }
        } catch (err) {
          console.error('Error fetching album names:', err);
        }
      }
      
      // Process each response item and create Track objects with images
      for (const item of topTracks) {
        if (!item.tracks) continue;
        
        const trackData = item.tracks as any;
        const albumId = trackData.album_id;
        
        // Create a Track object from the nested data
        const track: Track = {
          id: trackData.id || item.track_id,
          name: trackData.name || '',
          share_url: trackData.share_url,
          explicit: trackData.explicit,
          duration_ms: trackData.duration_ms,
          disc_number: trackData.disc_number,
          play_count: trackData.play_count,
          album_id: albumId,
          album_name: albumId ? albumNamesMap[albumId] || '' : undefined,
          // Create album object with image data
          album: albumId ? { 
            id: albumId, 
            name: albumNamesMap[albumId] || '',
            image: albumImagesMap[albumId]
          } : undefined,
          album_image: albumId ? albumImagesMap[albumId] : undefined,
          last_updated: trackData.last_updated
        };
        
        tracks.push(track);
      }
      
      // Sort by play count and limit results
      const sortedTracks = tracks
        .sort((a, b) => ((b.play_count || 0) - (a.play_count || 0)))
        .slice(0, limit);
        
      // Cache the result - 24 hours
      cacheService.set(cacheKey, sortedTracks, 24 * 60 * 60 * 1000);
      
      return sortedTracks;
    } catch (error) {
      console.error(`Error in getArtistTopTracks for artist ${artistId}:`, error);
      return [];
    }
  },

  /**
   * Get the total stream count for an artist from all their tracks
   */
  getArtistTotalStreamCount: async (artistId: string): Promise<number> => {
    // Add cache key
    const cacheKey = `artist-total-streams-${artistId}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<number>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
    
    try {
      // Step 1: Get all track IDs for this artist
      const { data: artistTracks, error: trackIdsError } = await supabase
        .from('artist_tracks')
        .select('track_id')
        .eq('artist_id', artistId);
      
      if (trackIdsError) {
        console.error(`Error fetching track IDs for artist ${artistId}:`, trackIdsError);
        return 0;
      }
      
      if (!artistTracks || artistTracks.length === 0) {
        return 0;
      }
      
      // Extract track IDs
      const trackIds = artistTracks.map(item => item.track_id);
      
      // Step 2: Get the actual track data including play counts
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('id, play_count')
        .in('id', trackIds);
      
      if (tracksError) {
        console.error(`Error fetching track data:`, tracksError);
        return 0;
      }
      
      if (!tracksData || tracksData.length === 0) {
        return 0;
      }
      
      // Sum up all play counts
      const totalStreams = tracksData.reduce((sum, track) => {
        return sum + (track.play_count || 0);
      }, 0);
      
      // Cache the result - 1 hour
      cacheService.set(cacheKey, totalStreams, 60 * 60 * 1000);
      
      return totalStreams;
    } catch (error) {
      console.error(`Error in getArtistTotalStreamCount for artist ${artistId}:`, error);
      return 0;
    }
  },

  /**
   * Get artists in a format suitable for select/multiselect dropdowns
   */
  getArtistsForSelect: async (): Promise<ArtistOption[]> => {
    const cacheKey = 'artists-for-select';
    
    // Try to get from cache first but with shorter expiry to ensure fresh data
    const cachedData = cacheService.get<ArtistOption[]>(cacheKey);
    if (cachedData) {
      // Remove verbose logging
      return cachedData;
    }
    
    try {
      // Fetch ALL artists without any filtering
      const { data, error } = await supabase
        .from('artists')
        .select(`
          id, 
          name,
          verified
        `)
        .order('name');
      
      if (error) {
        console.error('Error fetching artists for select:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.warn('No artists found in the database');
        return [];
      }
      
      // Minimal logging - just count
      console.log(`Fetched ${data.length} artists`);
      
      // Transform to dropdown options format
      const options: ArtistOption[] = data.map(artist => {
        // Format label with verification badge if verified
        const label = artist.verified 
          ? `${artist.name} ✓` 
          : artist.name;
          
        return {
          label,
          value: artist.id,
          // Don't fetch images to improve performance
          imageUrl: undefined
        };
      });
      
      // Cache the results for a shorter time (5 minutes for development, 15 minutes for production)
      const cacheTime = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000;
      cacheService.set(cacheKey, options, cacheTime);
      
      return options;
    } catch (error) {
      console.error('Error in getArtistsForSelect:', error);
      return [];
    }
  },
  
  /**
   * Search artists in the database by name
   * @param searchTerm The search term to look for in artist names
   * @returns Array of artist options matching the search
   */
  searchArtists: async (searchTerm: string): Promise<ArtistOption[]> => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      // If search term is too short, return empty result
      return [];
    }
    
    // Normalize search term - trim and lowercase
    const normalizedTerm = searchTerm.trim().toLowerCase();
    
    // Create a cache key for this search
    const cacheKey = `artists-search-${normalizedTerm}`;
    
    // Try to get from cache first
    const cachedResults = cacheService.get<ArtistOption[]>(cacheKey);
    if (cachedResults) {
      // Remove verbose logging
      return cachedResults;
    }
    
    try {
      // Minimal logging
      console.log(`Searching for artists: "${normalizedTerm}"`);
      
      // Search by name with case-insensitive pattern match 
      // using ilike for flexible matching (e.g., "hawk" will match "Bloody Hawk" too)
      const { data, error } = await supabase
        .from('artists')
        .select(`
          id, 
          name,
          verified
        `)
        .ilike('name', `%${normalizedTerm}%`)
        .order('name')
        .limit(100);
      
      if (error) {
        console.error('Error searching artists:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        // Minimal logging
        console.log(`No results for "${normalizedTerm}"`);
        return [];
      }
      
      // Minimal logging - just count
      console.log(`Found ${data.length} results for "${normalizedTerm}"`);
      
      // Transform to dropdown options format
      const options: ArtistOption[] = data.map(artist => {
        // Format label with verification badge if verified
        const label = artist.verified 
          ? `${artist.name} ✓` 
          : artist.name;
          
        return {
          label,
          value: artist.id,
          imageUrl: undefined
        };
      });
      
      // Cache the results for 5 minutes
      cacheService.set(cacheKey, options, 5 * 60 * 1000);
      
      return options;
    } catch (error) {
      console.error(`Error searching artists with term "${normalizedTerm}":`, error);
      return [];
    }
  }
}; 