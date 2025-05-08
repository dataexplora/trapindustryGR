import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArtistWithImages } from '../services/artistService';
import { Star, Music, User, Users, Headphones } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface ArtistCardProps {
  artist: ArtistWithImages;
  rank?: number;
  showRank?: boolean;
}

const ArtistCard = ({ artist, rank, showRank = true }: ArtistCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Default avatar placeholder
  const placeholderImage = 'https://placehold.co/400x400/252536/8A8AFF?text=Artist';
  
  // Use the artist's avatar image or fallback to placeholder
  const avatarImage = imageError || !artist.images?.avatar 
    ? placeholderImage 
    : artist.images.avatar;
  
  // Log the artist data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Rendering ArtistCard for ${artist.name}`, {
      id: artist.id,
      avatar: artist.images?.avatar,
      followers: artist.followers,
      monthly_listeners: artist.monthly_listeners
    });
  }
  
  return (
    <Link 
      to={`/artist/${artist.id}`} 
      className="group"
    >
      <div className="bg-dark-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-dark-border">
        <div className="relative">
          {showRank && rank && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-indigo-800 to-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10">
              {rank}
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/80 text-yellow-400 px-2 py-1 rounded-full z-10">
            <Headphones className="h-3 w-3 text-yellow-400" />
            <span className="text-xs">{formatNumber(artist.monthly_listeners || 0)}</span>
          </div>
          <img 
            src={avatarImage} 
            alt={artist.name} 
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Only log error in development mode
              if (process.env.NODE_ENV === 'development') {
                console.error(`Failed to load image for artist ${artist.name}`, {
                  attempted_url: avatarImage
                });
              }
              setImageError(true);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loops
              target.src = placeholderImage;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-24 opacity-90"></div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">{artist.name}</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-400 text-xs">{formatNumber(artist.followers || 0)} followers</span>
            </div>
            {artist.verified && (
              <div className="bg-indigo-900/30 text-indigo-400 rounded-full px-2 py-0.5 text-xs flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtistCard;
