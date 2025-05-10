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
  externalLinks?: ExternalLink[];
  topCities?: TopCity[];
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
  };
  last_updated?: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  color?: string;
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
    
    // Try to get from cache first
    const cachedData = cacheService.get<ArtistWithImages[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching top ${limit} artists from database...`);
      }
      
      // Fetch top artists by monthly listeners with null check
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .not('monthly_listeners', 'is', null) // Filter out null monthly_listeners
        .order('monthly_listeners', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching top artists:', error);
        throw error;
      }

      if (!artists || artists.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('No artists returned from database query');
          console.log('Falling back to hardcoded top artists');
        }
        
        // Fallback to hardcoded data when no artists are found
        const fallbackData = [
          {
            id: 'marzi-id',
            name: 'Marzi',
            monthly_listeners: 258000,
            followers: 15700,
            verified: true,
            images: {
              avatar: 'https://placehold.co/400x400/252536/8A8AFF?text=Marzi'
            }
          },
          {
            id: 'yungkapa-id',
            name: 'YungKapa',
            monthly_listeners: 245000,
            followers: 14300,
            verified: true,
            images: {
              avatar: 'https://placehold.co/400x400/252536/8A8AFF?text=YungKapa'
            }
          },
          {
            id: 'bigskendo-id',
            name: 'Big Skendo',
            monthly_listeners: 220000,
            followers: 12400,
            verified: true,
            images: {
              avatar: 'https://placehold.co/400x400/252536/8A8AFF?text=BigSkendo'
            }
          },
          {
            id: 'gmbeataz-id',
            name: 'GMBeaTz',
            monthly_listeners: 195000,
            followers: 10900,
            verified: true,
            images: {
              avatar: 'https://placehold.co/400x400/252536/8A8AFF?text=GMBeaTz'
            }
          }
        ] as ArtistWithImages[];
        
        // Cache the fallback data with a shorter expiration (1 minute)
        cacheService.set(cacheKey, fallbackData, 60 * 1000);
        return fallbackData;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Found ${artists.length} top artists, now fetching images and links...`);
        console.log('Sample artist data:', JSON.stringify(artists[0]));
      }

      // For each artist, fetch their images and external links
      const artistsWithData = await Promise.all(
        artists.map(async (artist) => {
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

          // Make sure monthly_listeners and followers are not undefined/null
          return {
            ...artist,
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
    } catch (error) {
      console.error('Error in getTopArtists:', error);
      throw error; // Re-throw to allow calling code to handle the error
    }
  },

  /**
   * Get an artist by ID
   */
  getArtistById: async (id: string): Promise<ArtistWithImages | null> => {
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

      return {
        ...artist,
        images: groupedImages,
        externalLinks: externalLinks || [],
        topCities: topCities || []
      } as ArtistWithImages;
    } catch (error) {
      console.error(`Error in getArtistById for ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Get artist's top tracks ordered by play count
   */
  getArtistTopTracks: async (artistId: string, limit = 5): Promise<Track[]> => {
    try {
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

      // Extract the tracks and sort by play count
      const tracks = topTracks
        .map(item => item.tracks)
        .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        .slice(0, limit);

      // Fetch album details and artwork for each track
      const tracksWithAlbums = await Promise.all(
        tracks.map(async (track) => {
          if (!track.album_id) {
            return track;
          }

          // Get album name and artwork
          const { data: album, error: albumError } = await supabase
            .from('albums')
            .select(`
              id, 
              name,
              album_images (
                url,
                width,
                height
              )
            `)
            .eq('id', track.album_id)
            .single();

          if (albumError) {
            console.error(`Error fetching album for track ${track.id}:`, albumError);
            return track;
          }

          // Get the largest album image
          const albumImage = album?.album_images?.length > 0
            ? album.album_images.reduce((largest, current) => {
                const currentSize = (current.width || 0) * (current.height || 0);
                const largestSize = (largest.width || 0) * (largest.height || 0);
                return currentSize > largestSize ? current : largest;
              })
            : undefined;

          return {
            ...track,
            album: {
              ...album,
              image: albumImage
            }
          };
        })
      );

      return tracksWithAlbums;
    } catch (error) {
      console.error(`Error in getArtistTopTracks for artist ${artistId}:`, error);
      return [];
    }
  },

  /**
   * Get the total stream count for an artist from all their tracks
   */
  getArtistTotalStreamCount: async (artistId: string): Promise<number> => {
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
      
      return totalStreams;
    } catch (error) {
      console.error(`Error in getArtistTotalStreamCount for artist ${artistId}:`, error);
      return 0;
    }
  }
}; 