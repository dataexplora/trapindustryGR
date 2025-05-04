
import React, { useState, useEffect } from 'react';
import { Song, spotifyService } from '../services/spotify';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import { ListOrdered } from 'lucide-react';

const SongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await spotifyService.getTopSongs();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <ListOrdered className="mr-2 h-6 w-6 text-greek-blue" />
          <h1 className="text-3xl font-bold">Top 50 Greek Songs</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-subtle text-xl">Loading songs...</div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {songs.map((song, index) => (
              <SongCard key={song.id} song={song} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SongsPage;
