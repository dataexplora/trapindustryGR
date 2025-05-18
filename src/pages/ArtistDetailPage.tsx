import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArtistWithImages, artistService } from '../services/artistService';
import { EventListItem, eventService } from '../services/eventService';
import Layout from '../components/Layout';
import SpotifyPlayer from '../components/SpotifyPlayer';
import ImageGallery from '../components/ImageGallery';
import SEO from '../components/SEO';
import ArtistReactionButtons from '../components/ArtistReactionButtons';
import CompactArtistReactions from '../components/CompactArtistReactions';
import EventCard from '@/components/EventCard';
import { pageCache } from '../lib/pageCache';
import { 
  Check, Music, User, Users, ExternalLink, Calendar, Heart, 
  Instagram, Twitter, Youtube, Facebook, Globe, Link2, Headphones,
  Play, Clock, ChevronDown, ChevronUp, MapPin, Image, Star, Flame
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

// Helper to clean up biography text
const cleanBiography = (text: string): string => {
  // Create a temporary div to parse HTML content
  const div = document.createElement('div');
  div.innerHTML = text;

  // Find all anchor tags
  const links = div.getElementsByTagName('a');

  // Replace each link with its data-name attribute value or remove it
  Array.from(links).forEach(link => {
    const name = link.getAttribute('data-name');
    if (name) {
      link.replaceWith(name);
    } else {
      link.replaceWith(link.textContent || '');
    }
  });

  return div.textContent || text;
};

const ArtistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistWithImages | null>(() => {
    // Initial state from page cache if available
    if (id) {
      const cachedData = pageCache.get<ArtistWithImages>(`artist-page-${id}`);
      return cachedData || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!artist); // Only loading if no cached artist
  const [topTracks, setTopTracks] = useState<any[]>(() => {
    // Initial state from page cache if available
    if (id) {
      const cachedData = pageCache.get<any[]>(`artist-tracks-${id}`);
      return cachedData || [];
    }
    return [];
  });
  const [upcomingEvents, setUpcomingEvents] = useState<EventListItem[]>(() => {
    if (id) {
      const cachedData = pageCache.get<EventListItem[]>(`artist-events-${id}`);
      return cachedData || [];
    }
    return [];
  });
  const [displayedTracks, setDisplayedTracks] = useState(5);
  const [totalStreams, setTotalStreams] = useState<number>(() => {
    // Initial state from page cache if available
    if (id) {
      const cachedData = pageCache.get<number>(`artist-streams-${id}`);
      return cachedData || 0;
    }
    return 0;
  });
  const [showTopCities, setShowTopCities] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isExpandedBio, setIsExpandedBio] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
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

  // Master data fetching function - uses proper error handling and caching
  useEffect(() => {
    let isMounted = true;
    
    const fetchArtistData = async () => {
      if (!id) return;
      
      // If we already have data from page cache, skip loading
      if (artist && topTracks.length > 0 && totalStreams > 0) {
        console.log(`Using page cached data for artist ${id}`);
        return;
      }
      
      setIsLoading(true);
      setDataLoadError(null);
      
      try {
        // Fetch all data in parallel for performance
        const [artistData, tracksData, streamsCount, eventsData] = await Promise.all([
          artistService.getArtistById(id),
          artistService.getArtistTopTracks(id, 20),
          artistService.getArtistTotalStreamCount(id),
          eventService.getEventsByArtist(id, 6)
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (artistData) {
            setArtist(artistData);
            setTopTracks(tracksData);
            setTotalStreams(streamsCount);
            setUpcomingEvents(eventsData);
            
            // Store in page cache for future navigations (24 hour expiry)
            pageCache.set(`artist-page-${id}`, artistData, 24 * 60 * 60 * 1000);
            pageCache.set(`artist-tracks-${id}`, tracksData, 24 * 60 * 60 * 1000);
            pageCache.set(`artist-streams-${id}`, streamsCount, 24 * 60 * 60 * 1000);
            pageCache.set(`artist-events-${id}`, eventsData, 24 * 60 * 60 * 1000);
          } else {
            setDataLoadError("Artist not found");
          }
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
        if (isMounted) {
          setDataLoadError("Failed to load artist data. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArtistData();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [id, artist, topTracks, totalStreams]);

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

  if (dataLoadError || !artist) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl text-white">Artist not found</h2>
          <p className="text-gray-300 mt-2">{dataLoadError || "The artist you're looking for doesn't exist or may have been removed."}</p>
          <Link to="/" className="text-indigo-400 hover:underline mt-4 inline-block">
            Return to Artists
          </Link>
        </div>
      </Layout>
    );
  }

  // Default image if none is available
  const avatarImage = artist.images?.avatar || 'https://via.placeholder.com/400x400?text=No+Avatar';
  const headerImage = artist.images?.header || 'https://via.placeholder.com/1200x300?text=No+Header+Image';

  // Create structured data for the artist
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `https://urbangreece.com/artist/${artist.id}`,
    'name': artist.name,
    'url': window.location.href,
    'image': avatarImage,
    'description': artist.biography ? cleanBiography(artist.biography) : undefined,
    'interactionStatistic': [
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/ListenAction',
        'userInteractionCount': artist.monthly_listeners || 0,
        'name': 'Monthly Listeners'
      },
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/FollowAction',
        'userInteractionCount': artist.followers || 0,
        'name': 'Followers'
      }
    ],
    'sameAs': artist.externalLinks ? artist.externalLinks.map(link => link.url) : undefined,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://urbangreece.com/artist/${artist.id}`
    }
  };

  // Create enhanced keywords for better SEO
  const enhancedKeywords = [
    artist.name,
    `${artist.name} artist`,
    `${artist.name} music`,
    `${artist.name} songs`,
    `${artist.name} greek`,
    'greek artist',
    'greek music artist',
    'greek urban music',
    'greek trap music',
    'greek hip hop artist',
    'popular greek artist',
    'spotify greek artist'
  ];
  
  // Create social links object
  const socialLinks: Record<string, string | undefined> = {};
  if (artist.externalLinks) {
    artist.externalLinks.forEach(link => {
      const lowerName = link.name.toLowerCase();
      if (lowerName.includes('spotify')) socialLinks.spotify = link.url;
      if (lowerName.includes('instagram')) socialLinks.instagram = link.url;
      if (lowerName.includes('youtube')) socialLinks.youtube = link.url;
      if (lowerName.includes('twitter') || lowerName.includes('x.com')) socialLinks.twitter = link.url;
    });
  }

  return (
    <>
      <SEO
        title={`${artist.name} - ${artist.monthly_listeners ? formatNumber(artist.monthly_listeners) + ' Monthly Listeners' : 'Greek Artist'} | Urban Greece`}
        description={artist.biography ? cleanBiography(artist.biography).substring(0, 160) : `Discover ${artist.name}, a popular Greek artist with ${formatNumber(artist.monthly_listeners || 0)} monthly listeners and ${formatNumber(artist.followers || 0)} followers.`}
        image={avatarImage}
        type="profile"
        author={artist.name}
        section="Artists"
        category="Music Artist"
        keywords={enhancedKeywords}
        followers={artist.followers}
        monthlyListeners={artist.monthly_listeners}
        socialLinks={socialLinks}
        structuredData={structuredData}
      />
    
      <Layout>
        <div className="relative">{/* AFTO EINAI TO HEADER */}
          <div 
            className="h-[38rem] md:h-[48rem] lg:h-[60rem] bg-gradient-to-r from-indigo-900 to-purple-900 bg-center bg-cover"
            style={{ backgroundImage: `url(${headerImage})` }} 
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          <div className="container mx-auto px-4">
            <div className="relative -mt-[18rem] md:-mt-[18rem] lg:-mt-[24rem]"> {/* AFTO EINAI TO ARTIST CARD */}
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

                    {/* Biography with Show More/Less */}
                    {artist.biography && (
                      <div className="mt-4 text-gray-300 max-w-2xl">
                        <p>
                          {isExpandedBio 
                            ? cleanBiography(artist.biography)
                            : cleanBiography(artist.biography).substring(0, 200)}
                          {artist.biography.length > 200 && !isExpandedBio && '...'}
                        </p>
                        {artist.biography.length > 200 && (
                          <button
                            onClick={() => setIsExpandedBio(!isExpandedBio)}
                            className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium flex items-center"
                          >
                            {isExpandedBio ? (
                              <>
                                Show Less <ChevronUp className="w-4 h-4 ml-1" />
                              </>
                            ) : (
                              <>
                                Show More <ChevronDown className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </button>
                        )}
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
                      
                      {/* Show world rank if available */}
                      {artist.world_rank && (
                        <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                          <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>World Rank</span>
                          </div>
                          <div className="text-xl font-bold text-white">
                            #{formatNumber(artist.world_rank)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Reactions - placed directly under the stats grid without a box */}
                    <div className="mt-4 flex justify-center md:justify-start">
                      <CompactArtistReactions artistId={artist.id} />
                    </div>
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
                <Link 
                  key={track.id} 
                  to={`/track/${track.id}`}
                  className="grid grid-cols-12 py-2 hover:bg-dark-muted rounded px-2 group cursor-pointer"
                >
                  <div 
                    className="col-span-1 flex items-center text-gray-400 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTrackClick(e, track.id);
                    }}
                  >
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
                </Link>
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
            <ImageGallery images={artist.images.gallery} alt={artist.name} />
          ) : (
            <p className="text-center text-gray-400">No gallery images available for this artist.</p>
          )}
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <section className="py-10 px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-400" />
                  Upcoming Events
                </h2>
                
                <Link 
                  to="/events" 
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View all events
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                  />
                ))}
              </div>
              
              {/* If no events */}
              {upcomingEvents.length === 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                  <h3 className="text-lg font-medium text-white mb-2">No Upcoming Events</h3>
                  <p className="text-slate-400">
                    {artist.name} doesn't have any upcoming events scheduled at the moment.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </Layout>
    </>
  );
};

export default ArtistDetailPage;
