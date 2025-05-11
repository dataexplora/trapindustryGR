import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArtistWithImages, artistService } from '../services/artistService';
import Layout from '../components/Layout';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { 
  Check, Music, User, Users, ExternalLink, Calendar, Heart, 
  Instagram, Twitter, Youtube, Facebook, Globe, Link2, Headphones,
  Play, Clock, ChevronDown, ChevronUp, MapPin, Image
} from 'lucide-react';
import { formatNumber, formatDuration } from '../utils/format';

// Helper to get the appropriate icon for a social link
const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram className="w-4 h-4" />;
  if (lowerName.includes('twitter') || lowerName.includes('x.com')) return <Twitter className="w-4 h-4" />;
  if (lowerName.includes('youtube')) return <Youtube className="w-4 h-4" />;
  if (lowerName.includes('facebook')) return <Facebook className="w-4 h-4" />;
  if (lowerName.includes('website') || lowerName.includes('homepage')) return <Globe className="w-4 h-4" />;
  return <Link2 className="w-4 h-4" />;
};

const ArtistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [displayedTracks, setDisplayedTracks] = useState(5);
  const [totalStreams, setTotalStreams] = useState<number>(0);
  const [showTopCities, setShowTopCities] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const topCitiesRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topCitiesRef.current && !topCitiesRef.current.contains(event.target as Node)) {
        setShowTopCities(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const artistData = await artistService.getArtistById(id);
          
          if (artistData) {
            setArtist(artistData);
            
            // Fetch top tracks
            const tracks = await artistService.getArtistTopTracks(id);
            setTopTracks(tracks);
            
            // Fetch total stream count
            const streams = await artistService.getArtistTotalStreamCount(id);
            setTotalStreams(streams);
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

  // Toggle top cities dropdown
  const toggleTopCities = () => {
    setShowTopCities(!showTopCities);
  };

  // Function to handle track click
  const handleTrackClick = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault(); // Prevent default link behavior
    setSelectedTrack(trackId);
  };

  // Function to handle showing more tracks
  const handleShowMore = () => {
    setDisplayedTracks(prev => prev + 5);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-subtle text-xl text-gray-300">Loading artist details...</div>
        </div>
      </Layout>
    );
  }

  if (!artist) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl text-white">Artist not found</h2>
          <Link to="/discover" className="text-indigo-400 hover:underline mt-4 inline-block">
            Return to Artists
          </Link>
        </div>
      </Layout>
    );
  }

  // Default image if none is available
  const avatarImage = artist.images?.avatar || 'https://via.placeholder.com/400x400?text=No+Avatar';
  const headerImage = artist.images?.header || 'https://via.placeholder.com/1200x300?text=No+Header+Image';

  return (
    <Layout>
      <div className="relative">
        <div 
          className="h-64 bg-gradient-to-r from-indigo-900 to-purple-900 bg-center bg-cover"
          style={{ backgroundImage: `url(${headerImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="relative -mt-24">
            <div className="bg-dark-card rounded-xl shadow-xl p-6 border border-dark-border">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <img 
                  src={avatarImage} 
                  alt={artist.name} 
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-dark-background shadow-md" 
                />
                <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start">
                    <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                    {artist.verified && (
                      <div className="ml-3 bg-[#1d9bf0] p-1 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {artist.externalLinks && artist.externalLinks.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start mt-3 space-x-3">
                      {artist.externalLinks.map(link => (
                        <a 
                          key={link.id} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors p-2 bg-dark-muted rounded-full border border-dark-border hover:border-indigo-500"
                          title={link.name}
                        >
                          {getSocialIcon(link.name)}
                        </a>
                      ))}
                    </div>
                  )}

                  {artist.biography && (
                    <div className="mt-4 text-gray-300 max-w-2xl">
                      <p>{artist.biography.length > 200 ? `${artist.biography.substring(0, 200)}...` : artist.biography}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-1 text-indigo-400" />
                        <span>Followers</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formatNumber(artist.followers || 0)}
                      </div>
                    </div>
                    
                    {/* Monthly Listeners Card with Dropdown */}
                    <div ref={topCitiesRef} className="relative">
                      <div 
                        className={`bg-dark-muted p-4 rounded-lg border ${showTopCities ? 'border-indigo-500' : 'border-dark-border'} ${artist.topCities && artist.topCities.length > 0 ? 'cursor-pointer hover:border-indigo-400' : ''}`}
                        onClick={artist.topCities && artist.topCities.length > 0 ? toggleTopCities : undefined}
                      >
                        <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                          <Heart className="w-4 h-4 mr-1 text-pink-400" />
                          <span>Monthly Listeners</span>
                          {artist.topCities && artist.topCities.length > 0 && (
                            <span className="ml-1">
                              {showTopCities ? 
                                <ChevronUp className="w-4 h-4 text-indigo-400" /> : 
                                <ChevronDown className="w-4 h-4 text-indigo-400" />
                              }
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-bold text-white">
                          {formatNumber(artist.monthly_listeners || 0)}
                        </div>
                      </div>
                      
                      {/* Top Cities Dropdown */}
                      {showTopCities && artist.topCities && artist.topCities.length > 0 && (
                        <div className="absolute z-10 mt-2 w-full bg-dark-card rounded-lg border border-dark-border shadow-xl overflow-hidden">
                          <div className="px-4 py-3 border-b border-dark-border bg-dark-card/80">
                            <h3 className="text-sm font-semibold text-white">Top Cities</h3>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {artist.topCities.map((city) => (
                              <div key={city.id} className="px-4 py-3 hover:bg-dark-muted border-b border-dark-border/50 last:border-b-0 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="w-8 h-6 flex items-center justify-center text-xs bg-dark-muted rounded mr-3 text-indigo-400 font-medium border border-indigo-400/30">
                                      {city.country}
                                    </span>
                                    <span className="text-white font-medium">{city.city}</span>
                                  </div>
                                  <div className="text-gray-400 text-sm font-medium">
                                    {formatNumber(city.listener_count)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                        <Play className="w-4 h-4 mr-1 text-green-400" />
                        <span>Total Streams</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formatNumber(totalStreams)}
                      </div>
                    </div>
                    {artist.world_rank ? (
                      <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                        <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span>World Rank</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          #{formatNumber(artist.world_rank)}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Spotify Link */}
                  {artist.share_url && (
                    <div className="mt-6">
                      <a 
                        href={artist.share_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Spotify
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Known For - Top Tracks Section */}
      {topTracks.length > 0 && (
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Headphones className="mr-2 h-5 w-5 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Known For</h2>
          </div>
          
          <div className="bg-dark-card rounded-xl shadow-lg border border-dark-border p-4">
            <div className="grid grid-cols-12 border-b border-dark-border pb-2 mb-4 text-gray-400 text-sm">
              <div className="col-span-1">#</div>
              <div className="col-span-6 md:col-span-5">Title</div>
              <div className="hidden md:block md:col-span-3">Album</div>
              <div className="col-span-4 md:col-span-2 text-right">Plays</div>
              <div className="col-span-1 text-right">Length</div>
            </div>
            
            {topTracks.slice(0, displayedTracks).map((track, index) => (
              <a 
                key={track.id} 
                href={track.share_url} 
                onClick={(e) => handleTrackClick(e, track.id)}
                className="grid grid-cols-12 py-2 hover:bg-dark-muted rounded px-2 group cursor-pointer"
              >
                <div className="col-span-1 flex items-center text-gray-400">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <Play className="w-4 h-4 hidden group-hover:block text-white" />
                </div>
                <div className="col-span-6 md:col-span-5 flex items-center">
                  {track.album?.image ? (
                    <img 
                      src={track.album.image.url} 
                      alt={track.album.name || 'Album cover'} 
                      className="w-10 h-10 rounded mr-3 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded mr-3 bg-dark-muted flex items-center justify-center">
                      <Music className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white truncate">
                      {track.name}
                      {track.explicit && (
                        <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-1 rounded">E</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block md:col-span-3 text-gray-400 truncate self-center">
                  {track.album?.name || '—'}
                </div>
                <div className="col-span-4 md:col-span-2 text-right text-gray-400 self-center">
                  {formatNumber(track.play_count || 0)}
                </div>
                <div className="col-span-1 text-right text-gray-400 self-center">
                  {formatDuration(track.duration_ms || 0)}
                </div>
              </a>
            ))}

            {topTracks.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleShowMore}
                  className="px-4 py-2 bg-[#1d1d1d] hover:bg-[#2d2d2d] text-gray-300 hover:text-white rounded-lg transition-colors duration-200 border border-[#333333] hover:border-[#444444] text-sm font-medium"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spotify Player Modal */}
      <SpotifyPlayer
        trackId={selectedTrack || ''}
        isOpen={!!selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Music className="mr-2 h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>
        
        {artist.images?.gallery && artist.images.gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.images.gallery.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-dark-border">
                <img 
                  src={image} 
                  alt={`${artist.name} - Gallery ${index + 1}`} 
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No gallery images available for this artist.</p>
        )}
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Calendar className="mr-2 h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Last Updated</h2>
        </div>
        
        <div className="bg-dark-card p-4 rounded-lg border border-dark-border max-w-lg mx-auto">
          <p className="text-center text-gray-300">
            {artist.last_updated ? new Date(artist.last_updated).toLocaleDateString() : 'No update information available'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistDetailPage;
