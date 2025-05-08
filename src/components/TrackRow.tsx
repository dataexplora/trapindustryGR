import React, { useState } from 'react';
import { Track } from '../services/trackService';
import { Music, ExternalLink, User, Disc } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface TrackRowProps {
  track: Track;
  rank: number;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, rank }) => {
  const [imageError, setImageError] = useState(false);
  
  // Format duration from milliseconds to mm:ss
  const formatDuration = (ms: number = 0) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format artist names as a comma-separated list
  const getArtistDisplay = () => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map(artist => artist.name).join(', ');
    }
    
    // Fallback to artist_name if available
    if (track.artist_name) {
      return track.artist_name;
    }
    
    return 'Unknown Artist';
  };

  // Get rank badge styling based on position
  const getRankBadgeStyle = () => {
    if (rank === 1) {
      // Gold for 1st place
      return "bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 border border-yellow-600 shadow-md";
    } else if (rank === 2) {
      // Silver for 2nd place
      return "bg-gradient-to-r from-gray-400 to-gray-300 text-gray-800 border border-gray-500 shadow-md";
    } else if (rank === 3) {
      // Bronze for 3rd place
      return "bg-gradient-to-r from-amber-700 to-amber-500 text-amber-100 border border-amber-800 shadow-md";
    } else {
      // Default styling for all other ranks
      return "bg-gradient-to-r from-indigo-800 to-purple-700 text-white";
    }
  };

  // Log the track data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Rendering TrackRow for ${track.name}`, {
      id: track.id,
      artist: track.artist_name || (track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown'),
      album: track.album_name,
      play_count: track.play_count,
      hasImage: !!track.album_image?.url
    });
  }

  return (
    <div className="flex items-center p-4 bg-dark-card rounded-xl border border-dark-border hover:bg-dark-card-hover transition-all duration-200">
      {/* Rank */}
      <div className={`mr-4 ${getRankBadgeStyle()} rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0`}>
        {rank}
      </div>
      
      {/* Album Cover */}
      {track.album_image?.url && !imageError ? (
        <div className="mr-4 w-12 h-12 rounded-md overflow-hidden shadow-md shrink-0">
          <img 
            src={track.album_image.url} 
            alt={`Cover for ${track.album_name || track.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (process.env.NODE_ENV === 'development') {
                console.error(`Failed to load album image for track ${track.name}`, {
                  attempted_url: track.album_image?.url
                });
              }
              setImageError(true);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loops
            }}
          />
        </div>
      ) : (
        <div className="mr-4 w-12 h-12 rounded-md overflow-hidden shadow-md shrink-0 bg-indigo-900/50 flex items-center justify-center">
          <Music className="h-6 w-6 text-indigo-400" />
        </div>
      )}
      
      {/* Track Info */}
      <div className="flex-grow">
        <div className="flex items-center">
          <h3 className="font-semibold text-white truncate">{track.name || 'Untitled Track'}</h3>
          {track.explicit && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">E</span>
          )}
        </div>
        
        {/* Artist */}
        <div className="flex items-center text-sm text-gray-400 mt-1">
          <User className="h-3 w-3 mr-1 text-indigo-400" />
          <span className="text-indigo-200 font-medium">
            {getArtistDisplay()}
          </span>
        </div>
      </div>
      
      {/* Album */}
      {track.album_name && (
        <div className="hidden md:flex items-center text-sm text-gray-400 truncate max-w-[200px] mx-4">
          <Disc className="h-3 w-3 mr-1 text-indigo-400/70" />
          {track.album_name}
        </div>
      )}
      
      {/* Stream Count */}
      <div className="text-right ml-4">
        <div className="text-indigo-400 font-medium whitespace-nowrap">
          {formatNumber(track.play_count || 0)} streams
        </div>
        <div className="text-xs text-gray-500 flex items-center justify-end">
          <Music className="h-3 w-3 mr-1" />
          {track.duration_ms ? formatDuration(track.duration_ms) : '0:00'}
          {track.share_url && (
            <a 
              href={track.share_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-gray-400 hover:text-indigo-400 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackRow; 