
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center p-3">
        {showRank && (
          <div className="mr-3 bg-greek-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
            {rank}
          </div>
        )}
        <div className="relative mr-3 shrink-0">
          <img src={song.imageUrl} alt={song.title} className="w-12 h-12 object-cover rounded-md" />
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="font-semibold truncate">{song.title}</h3>
          <p className="text-sm text-gray-600 truncate">{song.artist}</p>
        </div>
        <div className="flex flex-col items-end ml-3">
          <div className="text-sm text-gray-600">
            <span className="text-greek-blue font-medium">{formatNumber(song.streams)}</span>
          </div>
          <MusicVisualizer />
        </div>
      </div>
    </div>
  );
};

export default SongCard;
