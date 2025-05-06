import { supabase } from '@/lib/supabase';

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
   */
  getAllArtists: async (): Promise<ArtistWithImages[]> => {
    try {
      // Fetch artists from the database
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
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
    try {
      // Fetch top artists by monthly listeners
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .order('monthly_listeners', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching top artists:', error);
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

      return artistsWithData;
    } catch (error) {
      console.error('Error in getTopArtists:', error);
      return [];
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

      // Fetch album details for each track
      const tracksWithAlbums = await Promise.all(
        tracks.map(async (track) => {
          if (!track.album_id) {
            return track;
          }

          // Get album name
          const { data: album, error: albumError } = await supabase
            .from('albums')
            .select('id, name')
            .eq('id', track.album_id)
            .single();

          if (albumError) {
            console.error(`Error fetching album for track ${track.id}:`, albumError);
            return track;
          }

          return {
            ...track,
            album: album || undefined
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