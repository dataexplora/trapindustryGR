import React from 'react';
import { X } from 'lucide-react';

interface SpotifyPlayerProps {
  trackId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ trackId, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Extract the ID from the full Spotify URL if needed
  const spotifyId = trackId.includes('spotify.com') 
    ? trackId.split('/').pop() 
    : trackId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg p-4 w-full max-w-2xl mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="mt-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyId}`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer; 