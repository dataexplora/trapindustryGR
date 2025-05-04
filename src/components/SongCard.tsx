
import React from 'react';
import { Song } from '../services/spotify';
import { formatNumber } from '../utils/format';
import MusicVisualizer from './MusicVisualizer';

interface SongCardProps {
  song: Song;
  rank?: number;
  showRank?: boolean;
}

const SongCard = ({ song, rank = song.rank, showRank = true }: SongCardProps) => {
  return (
    <div className="bg-dark-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-dark-border">
      <div className="flex items-center p-4">
        {showRank && (
          <div className="mr-3 bg-gradient-to-r from-indigo-800 to-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
            {rank}
          </div>
        )}
        <div className="relative mr-4 shrink-0">
          <img src={song.imageUrl} alt={song.title} className="w-14 h-14 object-cover rounded-lg" />
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="font-semibold truncate text-white">{song.title}</h3>
          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
        </div>
        <div className="flex flex-col items-end ml-3">
          <div className="text-sm text-gray-400">
            <span className="text-indigo-400 font-medium">{formatNumber(song.streams)}</span>
          </div>
          <MusicVisualizer />
        </div>
      </div>
    </div>
  );
};

export default SongCard;
