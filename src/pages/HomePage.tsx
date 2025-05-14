import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { Button } from '@/components/ui/button';
import { Music, AlertTriangle, User, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

const HomePage = () => {
  const { topArtists, topTracks, isLoading, error, refreshData } = useData();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  // Check if we're using fallback data
  const isFromHardcodedData = 
    (topArtists.length > 0 && topArtists[0].id.includes('-id')) || 
    (topTracks.length > 0 && topTracks[0].id.includes('track'));
  
  // Function to handle playing a track
  const handlePlayTrack = (trackId: string) => {
    setSelectedTrack(trackId);
  };
  
  return (
    <Layout>
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Urban Greek Scene</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover the most popular urban Greek artists and songs shaping the culture today.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2 text-xl text-gray-300">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading music data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg border border-red-800">
            <p>{error}</p>
            <Button 
              variant="outline"
              className="mt-4 border-red-700 text-red-400 hover:bg-red-900/30"
              onClick={() => refreshData()}
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
                  onClick={() => refreshData()}
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Hot Artists</h2>
                </div>
                <Link to="/hot-artists">
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
                      onPlay={handlePlayTrack}
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
      
      {/* Spotify Player Modal */}
      <SpotifyPlayer
        trackId={selectedTrack || ''}
        isOpen={!!selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </Layout>
  );
};

export default HomePage;
