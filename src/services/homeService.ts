import { supabase } from '@/lib/supabase';
import { cacheService } from '@/lib/cacheService';

// Only the minimal types needed for homepage
export interface HomeArtist {
  id: string;
  name: string;
  monthly_listeners?: number;
  followers?: number;
  world_rank?: number;
  verified?: boolean;
  images?: {
    avatar?: string;
    header?: string;
  };
}

export interface HomeTrack {
  id: string;
  name: string;
  share_url?: string;
  explicit?: boolean;
  play_count?: number;
  duration_ms?: number;
  artist_name?: string;
  album_name?: string;
  album_image?: {
    url: string;
  };
}

export const homeService = {
  /**
   * Get top artists for homepage ONLY - uses cache table for efficiency
   * @param limit Number of artists to fetch
   */
  getTopArtists: async (limit = 4): Promise<HomeArtist[]> => {
    const cacheKey = `home-getTopArtists-${limit}`;
    
    // Try to get from in-memory cache first for instant loading
    const cachedData = cacheService.get<HomeArtist[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // OPTIMIZATION: Use a single JOIN query to get all artist data at once
      const { data, error } = await supabase
        .rpc('get_top_artists_with_images', { limit_count: limit });
        
      if (error || !data || data.length === 0) {
        console.error('Error fetching top artists with images:', error);
        return [];
      }
      
      // Transform the response into our HomeArtist type
      const artists: HomeArtist[] = data.map(item => ({
        id: item.id,
        name: item.name,
        monthly_listeners: item.monthly_listeners,
        followers: item.followers,
        world_rank: item.world_rank,
        verified: item.verified,
        images: {
          avatar: item.avatar_url,
          header: item.header_url
        }
      }));
      
      // Cache the result
      cacheService.set(cacheKey, artists);
      
      return artists;
    } catch (error) {
      console.error('Error in getTopArtists for homepage:', error);
      
      // Fallback: use the original implementation with separate queries
      try {
        // Step 1: Get top artist IDs from the cache table
        const { data: topArtistIds, error: cacheError } = await supabase
          .from('cached_top_artists')
          .select('artist_id, rank')
          .order('rank', { ascending: true })
          .limit(limit);
          
        if (cacheError || !topArtistIds || topArtistIds.length === 0) {
          console.error('Error fetching top artist IDs from cache:', cacheError);
          return [];
        }
        
        // Step 2: Extract the artist IDs
        const artistIds = topArtistIds.map(item => item.artist_id);
        
        // Step 3: Get the minimal artist data for these IDs
        const { data: artists, error: artistsError } = await supabase
          .from('artists')
          .select('id, name, monthly_listeners, followers, world_rank, verified')
          .in('id', artistIds);
          
        if (artistsError || !artists || artists.length === 0) {
          console.error('Error fetching artists by IDs:', artistsError);
          return [];
        }
        
        // Sort artists according to the order in the cache
        const rankedArtists = artists
          .map(artist => {
            const rankInfo = topArtistIds.find(item => item.artist_id === artist.id);
            return { 
              ...artist, 
              cacheRank: rankInfo ? rankInfo.rank : 999
            };
          })
          .sort((a, b) => a.cacheRank - b.cacheRank);
          
        // Step 4: Fetch only avatar images (most important for homepage)
        const { data: images, error: imagesError } = await supabase
          .from('artist_images')
          .select('artist_id, url, image_type')
          .in('artist_id', artistIds)
          .in('image_type', ['avatar', 'header']);

        if (imagesError) {
          console.error('Error fetching artist images:', imagesError);
        }
          
        // Add images to artists and return
        const artistsWithImages = rankedArtists.map(artist => {
          const artistImages = images?.filter(img => img.artist_id === artist.id) || [];
          
          return {
            ...artist,
            images: {
              avatar: artistImages.find(img => img.image_type === 'avatar')?.url || 
                    `https://placehold.co/400x400/252536/8A8AFF?text=${encodeURIComponent(artist.name)}`,
              header: artistImages.find(img => img.image_type === 'header')?.url,
            }
          };
        });
        
        // Cache the result
        cacheService.set(cacheKey, artistsWithImages);
        
        return artistsWithImages;
      } catch (fallbackError) {
        console.error('Error in fallback method for getTopArtists:', fallbackError);
        return [];
      }
    }
  },

  /**
   * Get top tracks for homepage ONLY - uses cache table for efficiency
   * @param limit Number of tracks to fetch
   */
  getTopTracks: async (limit = 5): Promise<HomeTrack[]> => {
    const cacheKey = `home-getTopTracks-${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<HomeTrack[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // OPTIMIZATION: Use a single JOIN query to get all track data at once
      const { data, error } = await supabase
        .rpc('get_top_tracks_with_details', { limit_count: limit });
        
      if (error || !data || data.length === 0) {
        console.error('Error fetching top tracks with details:', error);
        return [];
      }
      
      // Transform the response into our HomeTrack type
      const tracks: HomeTrack[] = data.map(item => ({
        id: item.id,
        name: item.name,
        share_url: item.share_url,
        explicit: item.explicit,
        play_count: item.play_count,
        duration_ms: item.duration_ms,
        artist_name: item.artist_name,
        album_name: item.album_name,
        album_image: item.album_image_url ? { url: item.album_image_url } : undefined
      }));
      
      // Cache the result
      cacheService.set(cacheKey, tracks);
      
      return tracks;
    } catch (error) {
      console.error('Error in getTopTracks for homepage:', error);
      
      // Fallback: use the original implementation with separate queries
      try {
        // Step 1: Get top track IDs from the cache table
        const { data: topTrackIds, error: cacheError } = await supabase
          .from('cached_top_tracks')
          .select('track_id, rank')
          .order('rank', { ascending: true })
          .limit(limit);
          
        if (cacheError || !topTrackIds || topTrackIds.length === 0) {
          console.error('Error fetching top track IDs from cache:', cacheError);
          return [];
        }
        
        // Step 2: Extract the track IDs
        const trackIds = topTrackIds.map(item => item.track_id);
        
        // Step 3: Get the minimal track data for these IDs
        const { data: tracks, error: tracksError } = await supabase
          .from('tracks')
          .select('id, name, share_url, explicit, play_count, duration_ms, album_id')
          .in('id', trackIds);
          
        if (tracksError || !tracks || tracks.length === 0) {
          console.error('Error fetching tracks by IDs:', tracksError);
          return [];
        }
        
        // Sort tracks according to the order in the cache
        const rankedTracks = tracks
          .map(track => {
            const rankInfo = topTrackIds.find(item => item.track_id === track.id);
            return { 
              ...track, 
              cacheRank: rankInfo ? rankInfo.rank : 999
            };
          })
          .sort((a, b) => a.cacheRank - b.cacheRank);
        
        // Get album IDs
        const albumIds = [...new Set(rankedTracks.filter(t => t.album_id).map(t => t.album_id))];
        
        // Step 4: Get album data (name and image)
        let albumMap: Record<string, {name: string, image?: {url: string}}> = {};
        
        if (albumIds.length > 0) {
          // Get album names
          const { data: albums, error: albumsError } = await supabase
            .from('albums')
            .select('id, name')
            .in('id', albumIds);
            
          if (albumsError) {
            console.error('Error fetching album names:', albumsError);
          } else if (albums) {
            // Initialize album map with names
            albums.forEach(album => {
              albumMap[album.id] = { name: album.name };
            });
            
            // Get album images
            const { data: albumImages, error: imagesError } = await supabase
              .from('album_images')
              .select('album_id, url')
              .in('album_id', albumIds);
              
            if (imagesError) {
              console.error('Error fetching album images:', imagesError);
            } else if (albumImages) {
              // Add image to album map
              albumImages.forEach(img => {
                if (albumMap[img.album_id]) {
                  albumMap[img.album_id].image = { url: img.url };
                }
              });
            }
          }
        }
        
        // Step 5: Get primary artists for each track
        const { data: trackArtists, error: artistsError } = await supabase
          .from('artist_tracks')
          .select(`
            track_id,
            is_primary,
            artists:artist_id(id, name)
          `)
          .in('track_id', trackIds)
          .eq('is_primary', true);
          
        let artistMap: Record<string, string> = {};
        
        if (artistsError) {
          console.error('Error fetching track artists:', artistsError);
        } else if (trackArtists) {
          trackArtists.forEach(relation => {
            if (relation.artists && relation.track_id) {
              artistMap[relation.track_id] = relation.artists.name;
            }
          });
        }
        
        // Combine all data
        const tracksWithData = rankedTracks.map(track => {
          return {
            ...track,
            artist_name: artistMap[track.id] || 'Unknown Artist',
            album_name: track.album_id && albumMap[track.album_id] ? albumMap[track.album_id].name : 'Unknown Album',
            album_image: track.album_id && albumMap[track.album_id] && albumMap[track.album_id].image ? 
                        albumMap[track.album_id].image : undefined
          };
        });
        
        // Cache the result
        cacheService.set(cacheKey, tracksWithData);
        
        return tracksWithData;
      } catch (fallbackError) {
        console.error('Error in fallback method for getTopTracks:', fallbackError);
        return [];
      }
    }
  }
}; 