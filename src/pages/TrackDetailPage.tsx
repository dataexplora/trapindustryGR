import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Track, trackService } from '../services/trackService';
import Layout from '../components/Layout';
import SpotifyPlayer from '../components/SpotifyPlayer';
import SEO from '../components/SEO';
import { 
  Play, Music, Calendar, Clock, Disc, ExternalLink, 
  Check, User, Share2, Heart, Star, ListMusic
} from 'lucide-react';
import { formatNumber, formatDuration } from '../utils/format';

// Helper function to get the year from a date string
const getYearFromDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).getFullYear().toString();
  } catch (e) {
    return '';
  }
};

const TrackDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    const fetchTrackData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          // Fetch track details
          const trackData = await trackService.getTrackById(id);
          if (trackData) {
            setTrack(trackData);
            
            // Fetch similar tracks
            const similarTracksData = await trackService.getSimilarTracks(id, 6);
            setSimilarTracks(similarTracksData);
          }
        }
      } catch (error) {
        console.error('Error fetching track data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackData();
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [id]);

  const handlePlayClick = () => {
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-subtle text-xl text-gray-300">Loading track details...</div>
        </div>
      </Layout>
    );
  }

  // Track not found state
  if (!track) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl text-white">Track not found</h2>
          <p className="text-gray-300 mt-2">The track you're looking for doesn't exist or may have been removed.</p>
          <Link to="/songs" className="text-indigo-400 hover:underline mt-4 inline-block">
            Browse all tracks
          </Link>
        </div>
      </Layout>
    );
  }

  // Default image if none is available
  const albumImage = track.album_image?.url || 'https://via.placeholder.com/400x400?text=No+Cover';
  
  // Create structured data for the track
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': `https://urbangreece.com/track/${track.id}`,
    'name': track.name,
    'url': window.location.href,
    'duration': track.duration_ms ? formatDuration(track.duration_ms) : undefined,
    'interactionStatistic': {
      '@type': 'InteractionCounter',
      'interactionType': 'https://schema.org/ListenAction',
      'userInteractionCount': track.play_count || 0
    },
    'recordingOf': {
      '@type': 'MusicComposition',
      'name': track.name
    },
    'inAlbum': track.album_name ? {
      '@type': 'MusicAlbum',
      'name': track.album_name,
      'datePublished': track.release_date
    } : undefined,
    'byArtist': track.artists && track.artists.length > 0 
      ? track.artists.map(artist => ({
          '@type': 'MusicGroup',
          'name': artist.name,
          '@id': `https://urbangreece.com/artist/${artist.id}`
        }))
      : {
          '@type': 'MusicGroup',
          'name': track.artist_name || 'Unknown Artist'
        }
  };
  
  // Create enhanced keywords for better SEO
  const artistNames = track.artists && track.artists.length > 0 
    ? track.artists.map(a => a.name).join(', ')
    : track.artist_name || '';
    
  const enhancedKeywords = [
    track.name,
    `${track.name} song`,
    `${track.name} ${artistNames}`,
    artistNames,
    'greek music',
    'greek urban music',
    'greek trap music',
    'greek hip hop',
    track.album_name || '',
    'stream greek music',
    'popular greek songs'
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={`${track.name} by ${artistNames} | Urban Greece`}
        description={`Listen to ${track.name} by ${artistNames}. ${track.play_count ? formatNumber(track.play_count) + ' streams. ' : ''}${track.album_name ? 'From the album ' + track.album_name + '.' : ''} Urban Greek music.`}
        image={albumImage}
        type="music.song"
        keywords={enhancedKeywords}
        duration={track.duration_ms ? formatDuration(track.duration_ms) : undefined}
        albumName={track.album_name}
        releaseDate={track.release_date}
        section="Music"
        category="Track"
        structuredData={structuredData}
      />
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-dark-card rounded-xl shadow-xl p-6 border border-dark-border">
            <div className="flex flex-col md:flex-row">
              {/* Album Art */}
              <div className="flex-shrink-0 w-full md:w-64 mb-6 md:mb-0">
                <div className="relative group">
                  <img 
                    src={albumImage} 
                    alt={`${track.name} cover`} 
                    className="w-full aspect-square object-cover rounded-lg shadow-lg border border-dark-border"
                  />
                  <button 
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <Play className="h-10 w-10 text-white" fill="white" />
                    </div>
                  </button>
                </div>
                
                {/* Track stats (mobile) */}
                <div className="md:hidden mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-dark-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(track.play_count || 0)}
                    </div>
                    <div className="text-xs text-gray-400">Streams</div>
                  </div>
                  
                  <div className="bg-dark-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatDuration(track.duration_ms || 0)}
                    </div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                </div>
              </div>
              
              {/* Track info */}
              <div className="md:ml-8 flex-grow">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-white mr-2">{track.name}</h1>
                  {track.explicit && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded">
                      Explicit
                    </span>
                  )}
                </div>
                
                {/* Artists */}
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {track.artists && track.artists.length > 0 ? (
                    track.artists.map((artist, index) => (
                      <React.Fragment key={artist.id}>
                        <Link 
                          to={`/artist/${artist.id}`} 
                          className="text-lg text-indigo-400 hover:text-indigo-300 font-medium flex items-center"
                        >
                          {artist.name}
                          {artist.verified && (
                            <span className="ml-1 bg-[#1d9bf0] p-0.5 rounded-full">
                              <Check className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </Link>
                        {index < (track.artists?.length || 0) - 1 && (
                          <span className="text-gray-500">•</span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-lg text-indigo-400 font-medium">{track.artist_name}</span>
                  )}
                </div>
                
                {/* Album and year */}
                {track.album_name && (
                  <div className="mt-4 flex items-center text-gray-300">
                    <Disc className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="mr-2">{track.album_name}</span>
                    {track.release_date && (
                      <>
                        <span className="text-gray-500 mx-2">•</span>
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{getYearFromDate(track.release_date)}</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Track stats (desktop) */}
                <div className="hidden md:grid grid-cols-3 gap-6 mt-8">
                  <div className="bg-dark-muted p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Music className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Total Streams</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(track.play_count || 0)}
                    </div>
                  </div>
                  
                  <div className="bg-dark-muted p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatDuration(track.duration_ms || 0)}
                    </div>
                  </div>
                  
                  <div className="bg-dark-muted p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Heart className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Popularity</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {track.popularity || '–'}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    onClick={handlePlayClick}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="h-4 w-4 mr-2" fill="white" />
                    Play on Spotify
                  </button>
                  
                  {track.share_url && (
                    <a 
                      href={track.share_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-dark-muted text-white rounded-lg flex items-center font-medium hover:bg-dark-muted/80 transition-all border border-dark-border"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Spotify
                    </a>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${track.name} by ${track.artist_name}`,
                          text: `Check out ${track.name} by ${track.artist_name} on Urban Greece`,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="px-3 py-2.5 bg-dark-muted text-white rounded-lg flex items-center font-medium hover:bg-dark-muted/80 transition-all border border-dark-border"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar Tracks Section */}
          {similarTracks.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <ListMusic className="h-5 w-5 mr-2 text-indigo-400" />
                  Similar Tracks
                </h2>
                <Link 
                  to="/songs" 
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarTracks.map(similarTrack => (
                  <Link 
                    key={similarTrack.id} 
                    to={`/track/${similarTrack.id}`}
                    className="bg-dark-card border border-dark-border rounded-lg p-4 hover:bg-dark-card/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-16 h-16 mr-4">
                        <img 
                          src={similarTrack.album_image?.url || 'https://via.placeholder.com/64x64?text=No+Cover'} 
                          alt={similarTrack.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-white font-medium truncate">{similarTrack.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{similarTrack.artist_name}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDuration(similarTrack.duration_ms || 0)}</span>
                          <span className="mx-2">•</span>
                          <Music className="h-3 w-3 mr-1" />
                          <span>{formatNumber(similarTrack.play_count || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Spotify Player */}
        <SpotifyPlayer 
          trackId={id || ''} 
          isOpen={isPlayerOpen} 
          onClose={closePlayer} 
        />
      </Layout>
    </>
  );
};

export default TrackDetailPage; 