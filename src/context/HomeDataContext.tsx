import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { HomeArtist, HomeTrack, homeService } from '@/services/homeService';

interface HomeDataContextType {
  topArtists: HomeArtist[];
  topTracks: HomeTrack[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const initialContextValue: HomeDataContextType = {
  topArtists: [],
  topTracks: [],
  isLoading: false,
  error: null,
  refreshData: async () => {}
};

const HomeDataContext = createContext<HomeDataContextType>(initialContextValue);

export const useHomeData = () => useContext(HomeDataContext);

interface HomeDataProviderProps {
  children: ReactNode;
}

export const HomeDataProvider: React.FC<HomeDataProviderProps> = ({ children }) => {
  const [topArtists, setTopArtists] = useState<HomeArtist[]>([]);
  const [topTracks, setTopTracks] = useState<HomeTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching homepage data...');
      
      try {
        // Get top artists with proper error handling
        const artists = await homeService.getTopArtists(4);
        setTopArtists(artists);
      } catch (artistError: any) {
        console.error('Error fetching top artists for homepage:', artistError);
        setTopArtists([]);
      }
      
      try {
        // Get top tracks with proper error handling
        const tracks = await homeService.getTopTracks(5);
        setTopTracks(tracks);
      } catch (trackError: any) {
        console.error('Error fetching top tracks for homepage:', trackError);
        setTopTracks([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching homepage data:', error);
      setError(`Failed to fetch homepage data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose refresh data function
  const refreshData = useCallback(async () => {
    await fetchHomeData();
  }, [fetchHomeData]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);
  
  const value: HomeDataContextType = {
    topArtists,
    topTracks,
    isLoading,
    error,
    refreshData
  };
  
  return (
    <HomeDataContext.Provider value={value}>
      {children}
    </HomeDataContext.Provider>
  );
}; 