import { supabase } from '@/lib/supabase';

export interface Artist {
  id: string;
  name: string;
  verified?: boolean;
  monthly_listeners?: number;
}

export interface Album {
  id: string;
  name: string;
  share_url?: string;
  release_date?: string;
}

export interface AlbumImage {
  url: string;
  width?: number;
  height?: number;
}

export interface Track {
  id: string;
  name: string;
  share_url?: string;
  explicit?: boolean;
  duration_ms?: number;
  play_count?: number;
  album_id?: string;
  artist_id?: string;  // For backwards compatibility
  album_name?: string; // Added for convenience
  artist_name?: string; // Added for convenience
  artists?: Artist[];  // Added to support multiple artists
  album_image?: AlbumImage; // Added for album artwork
}

export const trackService = {
  /**
   * Get most streamed tracks directly from Supabase
   * @param limit Max number of tracks to return (default 50)
   * @param minStreams Minimum stream count (default 1)
   * @returns Array of tracks sorted by play count
   */
  getMostStreamedTracks: async (limit = 50, minStreams = 1): Promise<Track[]> => {
    try {
      console.log(`Fetching tracks with min_streams: ${minStreams}, limit: ${limit}`);
      
      // First, get just the tracks data
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .gte('play_count', minStreams)
        .order('play_count', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
        
      console.log(`Supabase returned ${data?.length || 0} tracks`);
      
      if (!data || data.length === 0) {
        console.log('No tracks found matching criteria');
        return [];
      }
      
      // Get track IDs for fetching artist relationships
      const trackIds = data.map(track => track.id);
      
      // Get album IDs for fetching album names and images
      const albumIds = [...new Set(data.filter(t => t.album_id).map(t => t.album_id))];
      
      // Get album names
      let albumsMap: Record<string, string> = {};
      if (albumIds.length > 0) {
        try {
          const { data: albumsData } = await supabase
            .from('albums')
            .select('id, name')
            .in('id', albumIds);
            
          if (albumsData) {
            albumsMap = albumsData.reduce((acc, album) => ({
              ...acc,
              [album.id]: album.name
            }), {});
          }
        } catch (err) {
          console.error('Error fetching albums:', err);
        }
      }
      
      // Get album images
      let albumImagesMap: Record<string, AlbumImage> = {};
      if (albumIds.length > 0) {
        try {
          const { data: albumImagesData, error: albumImagesError } = await supabase
            .from('album_images')
            .select('album_id, url, width, height')
            .in('album_id', albumIds);
            
          if (albumImagesError) {
            console.error('Error fetching album images:', albumImagesError);
          } else if (albumImagesData && albumImagesData.length > 0) {
            // Use the first image for each album
            albumImagesMap = albumImagesData.reduce((acc, img) => {
              if (!acc[img.album_id]) {
                acc[img.album_id] = {
                  url: img.url,
                  width: img.width,
                  height: img.height
                };
              }
              return acc;
            }, {} as Record<string, AlbumImage>);
          }
        } catch (err) {
          console.error('Error processing album images:', err);
        }
      }
      
      // Get artist-track relationships
      let trackArtistsMap: Record<string, {id: string, name: string, is_primary: boolean}[]> = {};
      try {
        const { data: artistTracksData, error: artistTracksError } = await supabase
          .from('artist_tracks')
          .select(`
            artist_id,
            track_id,
            is_primary,
            artists:artist_id(id, name)
          `)
          .in('track_id', trackIds);
          
        if (artistTracksError) {
          console.error('Error fetching artist_tracks:', artistTracksError);
        } else if (artistTracksData) {
          // Group artists by track
          artistTracksData.forEach(relation => {
            const trackId = relation.track_id;
            const artist = relation.artists;
            
            if (!trackArtistsMap[trackId]) {
              trackArtistsMap[trackId] = [];
            }
            
            if (artist) {
              trackArtistsMap[trackId].push({
                ...artist,
                is_primary: relation.is_primary
              });
            }
          });
        }
      } catch (err) {
        console.error('Error processing artist-track relationships:', err);
      }
      
      // Combine all the data
      const tracksWithNames = data.map(track => {
        // Get artists for this track
        const trackArtists = trackArtistsMap[track.id] || [];
        
        // Find primary artist, or use first artist, or null
        const primaryArtist = trackArtists.find(a => a.is_primary) || trackArtists[0] || null;
        
        return {
          ...track,
          album_name: track.album_id ? albumsMap[track.album_id] || null : null,
          // For backward compatibility, use the primary artist's name
          artist_name: primaryArtist ? primaryArtist.name : null,
          // Keep artist_id for backward compatibility
          artist_id: primaryArtist ? primaryArtist.id : track.artist_id,
          // Add the full artists array
          artists: trackArtists.length > 0 
            ? trackArtists.map(a => ({
                id: a.id,
                name: a.name,
              }))
            : undefined,
          // Add album artwork if available
          album_image: track.album_id ? albumImagesMap[track.album_id] || null : null
        };
      });
      
      console.log("First track with names and artwork:", tracksWithNames[0]);
      return tracksWithNames;
    } catch (error) {
      console.error('Error fetching tracks from Supabase:', error);
      return [];
    }
  },
  
  /**
   * Get artist information by ID
   */
  getArtistById: async (artistId: string): Promise<Artist | null> => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();
        
      if (error) {
        console.error('Error fetching artist:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching artist:', error);
      return null;
    }
  },
  
  /**
   * Get album information by ID
   */
  getAlbumById: async (albumId: string): Promise<Album | null> => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', albumId)
        .single();
        
      if (error) {
        console.error('Error fetching album:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching album:', error);
      return null;
    }
  }
}; 