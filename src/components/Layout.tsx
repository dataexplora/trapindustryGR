
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ListOrdered, User } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <h1 className="text-xl font-bold">Ελληνική Μουσική</h1>
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className={`hover:text-white/80 transition-colors ${location.pathname === '/' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/artists" className={`hover:text-white/80 transition-colors ${location.pathname === '/artists' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                  Artist Kings
                </Link>
              </li>
              <li>
                <Link to="/songs" className={`hover:text-white/80 transition-colors ${location.pathname === '/songs' ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'}`}>
                  Top 50
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow bg-dark-background">
        {children}
      </main>
      
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Ελληνική Μουσική - Greek Music Rankings</p>
          <p className="text-sm opacity-75 mt-1">Stream data provided from Spotify</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
