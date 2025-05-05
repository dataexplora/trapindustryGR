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

export interface ArtistWithImages extends Artist {
  images?: {
    avatar?: string;
    header?: string;
    gallery?: string[];
  };
  externalLinks?: ExternalLink[];
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
    } catch (error) {
      console.error(`Error in getArtistById for ID ${id}:`, error);
      return null;
    }
  }
}; 