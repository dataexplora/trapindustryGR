import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Artist, Song, spotifyService } from '../services/spotify';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import { Star, ArrowUp, ArrowDown, Music, User } from 'lucide-react';
import { formatNumber } from '../utils/format';

const ArtistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const [artistData, songsData] = await Promise.all([
            spotifyService.getArtistById(id),
            spotifyService.getArtistSongs(id)
          ]);
          
          if (artistData) {
            setArtist(artistData);
            setSongs(songsData);
          }
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-subtle text-xl">Loading artist details...</div>
        </div>
      </Layout>
    );
  }

  if (!artist) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl">Artist not found</h2>
          <Link to="/artists" className="text-primary hover:underline mt-4 inline-block">
            Return to Artists
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="container mx-auto px-4">
          <div className="relative -mt-24">
            <div className="bg-white rounded-xl shadow-xl p-6 dark:bg-gray-800">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name} 
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-md" 
                />
                <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start">
                    <h1 className="text-3xl font-bold">{artist.name}</h1>
                    <div className="ml-3 bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      #{artist.rank}
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start flex-wrap mt-2 space-x-1">
                    {artist.genres.map((genre, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                        <User className="w-4 h-4 mr-1 text-indigo-600" />
                        Followers
                      </div>
                      <div className="text-xl font-bold text-indigo-600">
                        {formatNumber(artist.followers)}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                        <Music className="w-4 h-4 mr-1 text-indigo-600" />
                        Total Streams
                      </div>
                      <div className="text-xl font-bold text-indigo-600">
                        {formatNumber(artist.streams)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Music className="mr-2 h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-bold">Top Songs</h2>
        </div>
        
        {songs.length > 0 ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {songs.map((song, index) => (
              <SongCard key={song.id} song={song} rank={index + 1} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No songs found for this artist.</p>
        )}
      </div>
    </Layout>
  );
};

export default ArtistDetailPage;
