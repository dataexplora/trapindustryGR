
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Artist, Song, spotifyService } from '../services/spotify';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import SongCard from '../components/SongCard';
import { Button } from '@/components/ui/button';
import { Music, ListOrdered, User } from 'lucide-react';

const HomePage = () => {
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artists, songs] = await Promise.all([
          spotifyService.getTopArtists(),
          spotifyService.getTopSongs()
        ]);
        
        setTopArtists(artists.slice(0, 4));
        setTopSongs(songs.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Ελληνική Μουσική Rankings</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover the most popular Greek artists and songs based on Spotify streaming data.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-subtle text-xl text-gray-300">Loading music data...</div>
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Top Greek Artists</h2>
                </div>
                <Link to="/artists">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Music className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Top Greek Songs</h2>
                </div>
                <Link to="/songs">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {topSongs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
