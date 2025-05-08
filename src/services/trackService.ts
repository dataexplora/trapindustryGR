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
   * @returns Array of tracks sorted by play count
   */
  getMostStreamedTracks: async (limit = 50): Promise<Track[]> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching top ${limit} tracks from database...`);
      }
      
      // First, get just the tracks data
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .not('play_count', 'is', null) // Filter out null play counts
        .order('play_count', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
        
      if (process.env.NODE_ENV === 'development') {
        console.log(`Supabase returned ${data?.length || 0} tracks`);
      }
      
      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('No tracks found - falling back to hardcoded tracks');
        }
        
        // Fallback to hardcoded tracks if none are found in the database
        return [
          {
            id: 'track1',
            name: 'Κριτική',
            play_count: 2850000,
            artist_name: 'Marzi, YungKapa, Big Skendo',
            album_name: 'Κριτική - Single',
            explicit: true,
            duration_ms: 190000,
            artists: [
              { id: 'marzi-id', name: 'Marzi' },
              { id: 'yungkapa-id', name: 'YungKapa' },
              { id: 'bigskendo-id', name: 'Big Skendo' }
            ],
            album_image: {
              url: 'https://placehold.co/400x400/202530/8A8AFF?text=Album'
            }
          },
          {
            id: 'track2',
            name: 'Τέρμα',
            play_count: 2430000,
            artist_name: 'GMBeaTz, YungKapa',
            album_name: 'Τέρμα - Single',
            explicit: false,
            duration_ms: 175000,
            artists: [
              { id: 'gmbeataz-id', name: 'GMBeaTz' },
              { id: 'yungkapa-id', name: 'YungKapa' }
            ],
            album_image: {
              url: 'https://placehold.co/400x400/202530/8A8AFF?text=Album'
            }
          },
          {
            id: 'track3',
            name: 'Solo',
            play_count: 1950000,
            artist_name: 'Marzi',
            album_name: 'Solo - EP',
            explicit: true,
            duration_ms: 210000,
            artists: [
              { id: 'marzi-id', name: 'Marzi' }
            ],
            album_image: {
              url: 'https://placehold.co/400x400/202530/8A8AFF?text=Album'
            }
          },
          {
            id: 'track4',
            name: 'Βράδυ',
            play_count: 1780000,
            artist_name: 'Big Skendo, GMBeaTz',
            album_name: 'Βράδυ - Single',
            explicit: false,
            duration_ms: 195000,
            artists: [
              { id: 'bigskendo-id', name: 'Big Skendo' },
              { id: 'gmbeataz-id', name: 'GMBeaTz' }
            ],
            album_image: {
              url: 'https://placehold.co/400x400/202530/8A8AFF?text=Album'
            }
          },
          {
            id: 'track5',
            name: 'Χρόνια',
            play_count: 1650000,
            artist_name: 'YungKapa',
            album_name: 'Χρόνια - Single',
            explicit: true,
            duration_ms: 185000,
            artists: [
              { id: 'yungkapa-id', name: 'YungKapa' }
            ],
            album_image: {
              url: 'https://placehold.co/400x400/202530/8A8AFF?text=Album'
            }
          }
        ] as Track[];
      }
      
      // Get track IDs for fetching artist relationships
      const trackIds = data.map(track => track.id);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Getting additional data for ${trackIds.length} track IDs`);
      }
      
      // Get album IDs for fetching album names and images
      const albumIds = [...new Set(data.filter(t => t.album_id).map(t => t.album_id))];
      if (process.env.NODE_ENV === 'development') {
        console.log(`Found ${albumIds.length} unique album IDs`);
      }
      
      // Get album names
      let albumsMap: Record<string, string> = {};
      if (albumIds.length > 0) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('Fetching album names...');
          }
          const { data: albumsData, error: albumsError } = await supabase
            .from('albums')
            .select('id, name')
            .in('id', albumIds);
            
          if (albumsError) {
            console.error('Error fetching album names:', albumsError);
          } else if (albumsData) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Retrieved ${albumsData.length} album names`);
            }
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
          if (process.env.NODE_ENV === 'development') {
            console.log('Fetching album images...');
          }
          const { data: albumImagesData, error: albumImagesError } = await supabase
            .from('album_images')
            .select('album_id, url, width, height')
            .in('album_id', albumIds);
            
          if (albumImagesError) {
            console.error('Error fetching album images:', albumImagesError);
          } else if (albumImagesData && albumImagesData.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Retrieved ${albumImagesData.length} album images`);
            }
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
            
            // Log info about album images found
            if (process.env.NODE_ENV === 'development') {
              console.log(`Album images mapped for ${Object.keys(albumImagesMap).length} albums`);
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.log('No album images found in database');
          }
        } catch (err) {
          console.error('Error processing album images:', err);
        }
      }
      
      // Get artist-track relationships
      let trackArtistsMap: Record<string, {id: string, name: string, is_primary: boolean}[]> = {};
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching artist-track relationships...');
          // Log query for debugging
          console.log(`Querying artist_tracks table for ${trackIds.length} track IDs`);
        }
        
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
        } else if (artistTracksData && artistTracksData.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Retrieved ${artistTracksData.length} artist-track relationships`);
          
            // Log the first relationship for debugging structure
            if (artistTracksData.length > 0) {
              console.log('Sample artist-track relationship:', JSON.stringify(artistTracksData[0]));
            }
          }
          
          // Group artists by track - simplified approach
          artistTracksData.forEach(relation => {
            const trackId = relation.track_id;
            
            if (!trackArtistsMap[trackId]) {
              trackArtistsMap[trackId] = [];
            }
            
            // Add a simplified artist entry using the artist_id directly
            trackArtistsMap[trackId].push({
              id: relation.artist_id,
              name: 'Artist', // Fallback name
              is_primary: !!relation.is_primary
            });
          });
          
          // After adding all relationships, fetch actual artist names in a single query
          const artistIds = [...new Set(artistTracksData.map(rel => rel.artist_id))];
          if (process.env.NODE_ENV === 'development') {
            console.log(`Fetching details for ${artistIds.length} unique artists`);
          }
          
          const { data: artistsData, error: artistsFetchError } = await supabase
            .from('artists')
            .select('id, name')
            .in('id', artistIds);
            
          if (artistsFetchError) {
            console.error('Error fetching artist details:', artistsFetchError);
          } else if (artistsData && artistsData.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Retrieved ${artistsData.length} artist details`);
            }
            
            // Create a map of artist id -> name for quick lookups
            const artistNameMap: Record<string, string> = {};
            artistsData.forEach(artist => {
              artistNameMap[artist.id] = artist.name;
            });
            
            // Update the artist names in our map
            Object.keys(trackArtistsMap).forEach(trackId => {
              trackArtistsMap[trackId] = trackArtistsMap[trackId].map(artist => ({
                ...artist,
                name: artistNameMap[artist.id] || 'Unknown Artist'
              }));
            });
          }
          
          // Log tracks with no artists found
          if (process.env.NODE_ENV === 'development') {
            const tracksWithNoArtists = trackIds.filter(id => !trackArtistsMap[id] || trackArtistsMap[id].length === 0);
            if (tracksWithNoArtists.length > 0) {
              console.warn(`${tracksWithNoArtists.length} tracks have no artist relationships`);
            }
          }
        }
      } catch (err) {
        console.error('Error processing artist-track relationships:', err);
      }
      
      // Combine all the data
      if (process.env.NODE_ENV === 'development') {
        console.log('Combining track data with album and artist information...');
      }
      
      const tracksWithNames = data.map(track => {
        // Get artists for this track
        const trackArtists = trackArtistsMap[track.id] || [];
        
        // Find primary artist, or use first artist, or null
        const primaryArtist = trackArtists.find(a => a.is_primary) || trackArtists[0] || null;
        
        // Get album image with fallback
        const albumImage = track.album_id && albumImagesMap[track.album_id] ? 
          albumImagesMap[track.album_id] : 
          { url: `https://placehold.co/400x400/202530/8A8AFF?text=${encodeURIComponent(track.name || 'Album')}` };
        
        return {
          ...track,
          play_count: track.play_count || 0, // Ensure play_count is not null
          album_name: track.album_id ? albumsMap[track.album_id] || 'Unknown Album' : null,
          // For backward compatibility, use the primary artist's name
          artist_name: primaryArtist ? primaryArtist.name : track.artist_name || 'Unknown Artist',
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
          album_image: albumImage
        };
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Track data processing complete');
      
        // Log a sample track for debugging
        if (tracksWithNames.length > 0) {
          const sampleTrack = tracksWithNames[0];
          console.log("Sample track with detailed info:", {
            name: sampleTrack.name,
            artist: sampleTrack.artist_name,
            album: sampleTrack.album_name,
            hasImage: !!sampleTrack.album_image,
            play_count: sampleTrack.play_count
          });
        }
      }
      
      return tracksWithNames;
    } catch (error) {
      console.error('Error fetching tracks from Supabase:', error);
      throw error; // Re-throw to allow calling code to handle the error
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