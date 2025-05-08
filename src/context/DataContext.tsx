import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ArtistWithImages, artistService } from '@/services/artistService';
import { Track, trackService } from '@/services/trackService';

interface DataContextType {
  topArtists: ArtistWithImages[];
  topTracks: Track[];
  allArtists: ArtistWithImages[];
  allTracks: Track[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const initialContextValue: DataContextType = {
  topArtists: [],
  topTracks: [],
  allArtists: [],
  allTracks: [],
  isLoading: false,
  error: null,
  refreshData: async () => {}
};

const DataContext = createContext<DataContextType>(initialContextValue);

export const useData = () => useContext(DataContext);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [topArtists, setTopArtists] = useState<ArtistWithImages[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [allArtists, setAllArtists] = useState<ArtistWithImages[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTopData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const artists = await artistService.getTopArtists(4);
      setTopArtists(artists);
      
      const tracks = await trackService.getMostStreamedTracks(5);
      setTopTracks(tracks);
    } catch (error: any) {
      console.error('Error fetching top data:', error);
      setError(`Failed to fetch data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchAllData = useCallback(async () => {
    try {
      const artists = await artistService.getAllArtists();
      setAllArtists(artists);
      
      const tracks = await trackService.getMostStreamedTracks(50);
      setAllTracks(tracks);
    } catch (error: any) {
      console.error('Error fetching all data:', error);
    }
  }, []);
  
  const refreshData = useCallback(async () => {
    await fetchTopData();
    await fetchAllData();
  }, [fetchTopData, fetchAllData]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchTopData();
    fetchAllData();
  }, [fetchTopData, fetchAllData]);
  
  const value: DataContextType = {
    topArtists,
    topTracks,
    allArtists,
    allTracks,
    isLoading,
    error,
    refreshData
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 