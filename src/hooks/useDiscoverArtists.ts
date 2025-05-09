import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArtistWithImages } from '@/services/artistService';

interface RankedArtist extends ArtistWithImages {
  rank?: number;
}

interface CachedData {
  artists: RankedArtist[];
  timestamp: number;
}

const CACHE_KEY = 'urban_greece_artists_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useDiscoverArtists = () => {
  // Store all artists with their global ranks
  const [allArtistsWithRanks, setAllArtistsWithRanks] = useState<RankedArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache = JSON.parse(cached) as CachedData;
      const now = Date.now();

      // Check if cache is expired
      if (now - parsedCache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedCache;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setCachedData = (artists: RankedArtist[]) => {
    try {
      const cacheData: CachedData = {
        artists,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const fetchAllArtists = async (forceFetch: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first if not forcing a fetch
      if (!forceFetch) {
        const cachedData = getCachedData();
        if (cachedData) {
          console.log('Using cached artists data');
          setAllArtistsWithRanks(cachedData.artists);
          setIsLoading(false);
          return;
        }
      }

      // Fetch ALL artists
      const { data: artists, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .order('monthly_listeners', { ascending: false });

      if (artistsError) {
        throw artistsError;
      }

      if (!artists) {
        setAllArtistsWithRanks([]);
        return;
      }

      // For each artist, fetch their images and external links
      const artistsWithData = await Promise.all(
        artists.map(async (artist, index) => {
          // Add global rank based on the complete sorted order
          const artistWithRank = {
            ...artist,
            rank: index + 1 // Global rank out of all artists
          };

          // Fetch images
          const { data: images, error: imagesError } = await supabase
            .from('artist_images')
            .select('*')
            .eq('artist_id', artist.id);

          if (imagesError) {
            console.error(`Error fetching images for artist ${artist.id}:`, imagesError);
            return {
              ...artistWithRank,
              externalLinks: []
            } as RankedArtist;
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
            ...artistWithRank,
            images: groupedImages,
            externalLinks: externalLinks || []
          } as RankedArtist;
        })
      );

      // Save to cache
      setCachedData(artistsWithData);

      setAllArtistsWithRanks(artistsWithData);
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      setError(error.message || 'Failed to fetch artists');
      
      // If fetch fails, try to use cached data as fallback
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('Using cached data as fallback after fetch error');
        setAllArtistsWithRanks(cachedData.artists);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    // Force fetch new data, bypassing cache
    fetchAllArtists(true);
  };

  useEffect(() => {
    fetchAllArtists();
  }, []);

  // Return all artists with their global ranks
  return { 
    allArtists: allArtistsWithRanks,
    totalArtists: allArtistsWithRanks.length,
    isLoading, 
    error, 
    refreshData 
  };
}; 