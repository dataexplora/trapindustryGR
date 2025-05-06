import React from 'react';
import { Link } from 'react-router-dom';
import { ArtistWithImages } from '../services/artistService';
import { Star, Music, User, Users, Headphones } from 'lucide-react';
import MusicVisualizer from './MusicVisualizer';
import { formatNumber } from '../utils/format';

interface ArtistCardProps {
  artist: ArtistWithImages;
  rank?: number;
  showRank?: boolean;
}

const ArtistCard = ({ artist, rank, showRank = true }: ArtistCardProps) => {
  // Default avatar image if none is available
  const avatarImage = artist.images?.avatar || 'https://via.placeholder.com/400x400?text=No+Image';
  
  // Choose what genres to display - we'll use a placeholder since genres aren't in our DB schema
  const genres = ['Music'];

  return (
    <Link 
      to={`/artist/${artist.id}`} 
      className="group"
    >
      <div className="bg-dark-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border border-dark-border">
        <div className="relative">
          {showRank && rank && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-indigo-800 to-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {rank}
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/80 text-yellow-400 px-2 py-1 rounded-full">
            <Headphones className="h-3 w-3 text-yellow-400" />
            <span className="text-xs">{formatNumber(artist.monthly_listeners || 0)}</span>
          </div>
          <img 
            src={avatarImage} 
            alt={artist.name} 
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
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
