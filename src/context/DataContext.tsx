import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ArtistWithImages, artistService } from '@/services/artistService';
import { Track, trackService } from '@/services/trackService';

interface DataContextType {
  topArtists: ArtistWithImages[];
  topTracks: Track[];
  allArtists: ArtistWithImages[];
  allTracks: Track[];
  isLoading: boolean;
  isLoadingAll: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  loadTopData: () => Promise<void>;
  allDataLoaded: boolean;
  topDataLoaded: boolean;
}

const initialContextValue: DataContextType = {
  topArtists: [],
  topTracks: [],
  allArtists: [],
  allTracks: [],
  isLoading: false,
  isLoadingAll: false,
  error: null,
  refreshData: async () => {},
  loadAllData: async () => {},
  loadTopData: async () => {},
  allDataLoaded: false,
  topDataLoaded: false
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
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [topDataLoaded, setTopDataLoaded] = useState(false);
  
  const fetchTopData = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('DataContext: Loading top artists and tracks...');
      
      try {
        const artists = await artistService.getTopArtists(4);
        const validArtists = artists.filter(artist => artist && artist.id);
        
        if (validArtists.length === 0 && artists.length > 0) {
          console.warn('Received artists data but all items were invalid or null');
        }
        
        setTopArtists(validArtists);
      } catch (artistError: any) {
        console.error('Error fetching top artists:', artistError);
        setTopArtists([]);
      }
      
      try {
        const tracks = await trackService.getMostStreamedTracks(5);
        const validTracks = tracks.filter(track => track && track.id);
        
        if (validTracks.length === 0 && tracks.length > 0) {
          console.warn('Received tracks data but all items were invalid or null');
        }
        
        setTopTracks(validTracks);
      } catch (trackError: any) {
        console.error('Error fetching top tracks:', trackError);
        setTopTracks([]);
      }
      
      setTopDataLoaded(true);
    } catch (error: any) {
      console.error('Error fetching top data:', error);
      setError(`Failed to fetch data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  const fetchAllData = useCallback(async () => {
    if (allDataLoaded || isLoadingAll) return;
    
    try {
      setIsLoadingAll(true);
      console.log('DataContext: Loading all artists and tracks data...');
      
      try {
        const artists = await artistService.getAllArtists();
        const validArtists = artists.filter(artist => artist && artist.id);
        setAllArtists(validArtists);
        console.log(`DataContext: Loaded ${validArtists.length} artists`);
      } catch (artistError: any) {
        console.error('Error fetching all artists:', artistError);
        setAllArtists([]);
      }
      
      try {
        const tracks = await trackService.getMostStreamedTracks(50);
        const validTracks = tracks.filter(track => track && track.id);
        setAllTracks(validTracks);
        console.log(`DataContext: Loaded ${validTracks.length} tracks`);
      } catch (trackError: any) {
        console.error('Error fetching all tracks:', trackError);
        setAllTracks([]);
      }
      
      setAllDataLoaded(true);
    } catch (error: any) {
      console.error('Error fetching all data:', error);
    } finally {
      setIsLoadingAll(false);
    }
  }, [allDataLoaded, isLoadingAll]);
  
  const loadTopData = useCallback(() => {
    return fetchTopData();
  }, [fetchTopData]);
  
  const loadAllData = useCallback(() => {
    if (!topDataLoaded) {
      return fetchTopData().then(() => fetchAllData());
    }
    return fetchAllData();
  }, [fetchAllData, fetchTopData, topDataLoaded]);
  
  const refreshData = useCallback(async () => {
    if (topDataLoaded) {
      await fetchTopData();
    }
    if (allDataLoaded) {
      await fetchAllData();
    }
  }, [fetchTopData, fetchAllData, topDataLoaded, allDataLoaded]);
  
  const value: DataContextType = {
    topArtists,
    topTracks,
    allArtists,
    allTracks,
    isLoading,
    isLoadingAll,
    error,
    refreshData,
    loadAllData,
    loadTopData,
    allDataLoaded,
    topDataLoaded
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 