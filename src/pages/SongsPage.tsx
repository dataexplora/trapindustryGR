import React from 'react';
import Layout from '../components/Layout';
import TrackRow from '../components/TrackRow';
import { ListMusic, TrendingUp, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

const SongsPage = () => {
  const { allTracks: tracks, isLoading, error, refreshData } = useData();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <TrendingUp className="mr-2 h-6 w-6 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Most Streamed Tracks</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2 text-xl text-gray-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading tracks...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-center text-red-200">
              <p>{error}</p>
              <button 
                onClick={() => refreshData()}
                className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-md text-red-200 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : tracks.length === 0 ? (
            <div className="bg-dark-card rounded-lg p-8 text-center">
              <ListMusic className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-300 text-lg">No tracks found</p>
              <p className="text-gray-500 text-sm mt-2">Please try again later</p>
            </div>
          ) : (
            <>
              <div className="text-right mb-3 text-sm text-gray-400">
                Showing top {tracks.length} most streamed tracks
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
