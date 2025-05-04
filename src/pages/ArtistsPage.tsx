
import React, { useState, useEffect } from 'react';
import { Artist, spotifyService } from '../services/spotify';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { User } from 'lucide-react';

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await spotifyService.getTopArtists();
        setArtists(data);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <User className="mr-2 h-6 w-6 text-greek-blue" />
          <h1 className="text-3xl font-bold">Greek Artist Kings</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-subtle text-xl">Loading artists...</div>
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
