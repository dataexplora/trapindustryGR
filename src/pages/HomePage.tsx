import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import { Button } from '@/components/ui/button';
import { Music, AlertTriangle, User } from 'lucide-react';
import { ArtistWithImages, artistService } from '../services/artistService';
import { Track, trackService } from '../services/trackService';
import { supabase } from '@/lib/supabase';

const HomePage = () => {
  const [topArtists, setTopArtists] = useState<ArtistWithImages[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromHardcodedData, setIsFromHardcodedData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsFromHardcodedData(false);
        
        // Fetch top artists
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching top artists...');
        }
        const artists = await artistService.getTopArtists(4);
        if (process.env.NODE_ENV === 'development') {
          console.log('Artists data:', artists);
        }
        
        // Check if this is hardcoded data
        if (artists.length > 0 && artists[0].id.includes('-id')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using hardcoded artist data as fallback');
          }
          setIsFromHardcodedData(true);
        }
        
        if (artists && artists.length > 0) {
          // Log each artist to see what data we're getting
          if (process.env.NODE_ENV === 'development') {
            artists.forEach((artist, index) => {
              console.log(`Artist ${index + 1}: ${artist.name}`, {
                id: artist.id,
                followers: artist.followers,
                monthly_listeners: artist.monthly_listeners,
                images: artist.images,
                has_avatar: artist.images?.avatar ? 'Yes' : 'No'
              });
            });
          }
          setTopArtists(artists);
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('No artists returned from artistService.getTopArtists');
        }
        
        // Fetch top tracks
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching top tracks...');
        }
        const tracks = await trackService.getMostStreamedTracks(5);
        if (process.env.NODE_ENV === 'development') {
          console.log('Tracks data:', tracks);
        }
        
        // Check if this is hardcoded data
        if (tracks.length > 0 && tracks[0].id.includes('track')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using hardcoded track data as fallback');
          }
          setIsFromHardcodedData(true);
        }
        
        if (tracks && tracks.length > 0) {
          // Log each track to see what data we're getting
          if (process.env.NODE_ENV === 'development') {
            tracks.forEach((track, index) => {
              console.log(`Track ${index + 1}: ${track.name}`, {
                id: track.id,
                album: track.album_name,
                artist: track.artist_name,
                play_count: track.play_count,
                has_image: track.album_image?.url ? 'Yes' : 'No'
              });
            });
          }
          setTopTracks(tracks);
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('No tracks returned from trackService.getMostStreamedTracks');
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch data: ${error.message || 'Unknown error'}`);
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
            Discover the most popular Greek artists and songs based on streaming data.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl text-gray-300">Loading music data...</div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg border border-red-800">
            <p>{error}</p>
            <Button 
              variant="outline"
              className="mt-4 border-red-700 text-red-400 hover:bg-red-900/30"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {isFromHardcodedData && (
              <div className="mb-8 p-4 bg-amber-900/30 border border-amber-800 rounded-lg flex items-center">
                <AlertTriangle className="h-6 w-6 text-amber-400 mr-3 flex-shrink-0" />
                <div className="text-amber-300 text-sm flex-grow">
                  <p>
                    <strong>Note:</strong> Unable to retrieve live data from the database. 
                    Displaying fallback data for preview purposes.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-4 border-amber-700 text-amber-400 hover:bg-amber-900/50"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Top Artists</h2>
                </div>
                <Link to="/top-artists">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topArtists.length > 0 ? (
                  topArtists.map((artist, index) => (
                    <ArtistCard 
                      key={artist.id} 
                      artist={artist} 
                      rank={index + 1}
                      showRank={true}
                    />
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10 text-gray-400">
                    <p>No artists found in database.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Music className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Top Songs</h2>
                </div>
                <Link to="/songs">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {topTracks.length > 0 ? (
                  topTracks.map((track, index) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      rank={index + 1} 
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>No tracks found in database.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
