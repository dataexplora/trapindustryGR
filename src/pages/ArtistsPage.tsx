import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { User, SlidersHorizontal, Users, Loader2 } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { useData } from '@/context/DataContext';

const ArtistsPage = () => {
  const { allArtists, isLoading, error, refreshData } = useData();
  const [minListeners, setMinListeners] = useState(100000); // Default minimum 100k

  // Filter artists based on minListeners
  const filteredArtists = useMemo(() => {
    return allArtists.filter(artist => 
      artist.monthly_listeners !== undefined && 
      artist.monthly_listeners >= minListeners
    );
  }, [allArtists, minListeners]);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <User className="mr-2 h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Artists Collection</h1>
          </div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Min. Monthly Listeners:</span>
            <select
              value={minListeners}
              onChange={(e) => setMinListeners(Number(e.target.value))}
              className="bg-dark-card border border-dark-border text-white rounded-md px-3 py-1"
            >
              <option value={0}>All Artists</option>
              <option value={100000}>100K+</option>
              <option value={250000}>250K+</option>
              <option value={500000}>500K+</option>
              <option value={1000000}>1M+</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4 bg-dark-card rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-gray-300">
              {filteredArtists.length} artists with {minListeners > 0 ? `${formatNumber(minListeners)}+` : 'any'} monthly listeners
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            Sorted by popularity (monthly listeners)
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2 text-xl text-gray-300">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading artists...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => refreshData()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No artists found matching the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArtistsPage;
