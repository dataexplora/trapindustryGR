import React, { useState, useEffect } from 'react';
import { Track, trackService } from '../services/trackService';
import Layout from '../components/Layout';
import TrackRow from '../components/TrackRow';
import { ListMusic, TrendingUp, Filter, RefreshCw } from 'lucide-react';

const streamThresholds = [
  { value: 1, label: 'All' },
  { value: 100, label: '100+' },
  { value: 1000, label: '1K+' },
  { value: 10000, label: '10K+' },
  { value: 50000, label: '50K+' },
  { value: 100000, label: '100K+' },
  { value: 500000, label: '500K+' }
];

const SongsPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minStreams, setMinStreams] = useState(1); // Start with showing all tracks
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMostStreamedTracks = async (streamThreshold: number) => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      setError(null);
      
      console.log(`Fetching tracks with minimum ${streamThreshold} streams...`);
      const data = await trackService.getMostStreamedTracks(50, streamThreshold);
      
      console.log(`Fetched ${data.length} tracks with ${streamThreshold}+ streams`);
      if (data.length > 0) {
        console.log('Sample track:', data[0]);
      }
      
      setTracks(data);
    } catch (err: any) {
      console.error('Error fetching tracks:', err);
      setError(`Failed to load tracks: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMostStreamedTracks(minStreams);
  }, [minStreams]);

  const handleStreamThresholdChange = (threshold: number) => {
    setMinStreams(threshold);
  };

  const handleRefresh = () => {
    fetchMostStreamedTracks(minStreams);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <TrendingUp className="mr-2 h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Most Streamed Tracks</h1>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-400 text-sm mr-2">Min streams:</span>
              <select 
                className="bg-dark-card border border-dark-border text-white py-1 px-2 rounded text-sm"
                value={minStreams}
                onChange={(e) => handleStreamThresholdChange(Number(e.target.value))}
                disabled={isLoading}
              >
                {streamThresholds.map(threshold => (
                  <option key={threshold.value} value={threshold.value}>
                    {threshold.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center bg-indigo-900/50 hover:bg-indigo-800/50 text-white py-1 px-3 rounded text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading && !isRefreshing ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-xl text-gray-300">Loading tracks...</div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-center text-red-200">
              {error}
            </div>
          ) : tracks.length === 0 ? (
            <div className="bg-dark-card rounded-lg p-8 text-center">
              <ListMusic className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-300 text-lg">No tracks found with {minStreams.toLocaleString()}+ streams</p>
              <p className="text-gray-500 text-sm mt-2">Try lowering the minimum stream count</p>
            </div>
          ) : (
            <>
              <div className="text-right mb-3 text-sm text-gray-400">
                Showing {tracks.length} tracks with {minStreams > 1 ? `${minStreams.toLocaleString()}+` : 'any number of'} streams
              </div>
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <TrackRow key={track.id} track={track} rank={index + 1} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SongsPage;
