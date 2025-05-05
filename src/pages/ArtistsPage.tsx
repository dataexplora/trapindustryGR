import React, { useState, useEffect } from 'react';
import { ArtistWithImages, artistService } from '../services/artistService';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { User } from 'lucide-react';

const ArtistsPage = () => {
  const [artists, setArtists] = useState<ArtistWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await artistService.getAllArtists();
        setArtists(data);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError('Failed to load artists. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center mb-8">
          <User className="mr-2 h-6 w-6 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Artists Collection</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-subtle text-xl text-gray-300">Loading artists...</div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
            >
              Try Again
            </button>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No artists found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArtistsPage;
