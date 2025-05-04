
import React from 'react';

const MusicVisualizer = () => {
  return (
    <div className="flex items-end space-x-1 h-4">
      <div className="w-1 bg-greek-blue animate-music-bar-1 rounded-t"></div>
      <div className="w-1 bg-greek-blue animate-music-bar-2 rounded-t"></div>
      <div className="w-1 bg-greek-blue animate-music-bar-3 rounded-t"></div>
      <div className="w-1 bg-greek-blue animate-music-bar-1 rounded-t" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-1 bg-greek-blue animate-music-bar-2 rounded-t" style={{ animationDelay: '0.15s' }}></div>
    </div>
  );
};

export default MusicVisualizer;
