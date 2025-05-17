import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import FeaturedEvents from '../components/FeaturedEvents';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { Button } from '@/components/ui/button';
import { Music, AlertTriangle, User, Loader2 } from 'lucide-react';
import { useHomeData } from '@/context/HomeDataContext';

const HomePage = () => {
  const { topArtists, topTracks, isLoading, error, refreshData } = useHomeData();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  // Check if we're using fallback data
  const isFromHardcodedData = 
    (topArtists.length > 0 && topArtists[0]?.id?.includes('-id')) || 
    (topTracks.length > 0 && topTracks[0]?.id?.includes('track'));
  
  // Function to handle playing a track
  const handlePlayTrack = (trackId: string) => {
    setSelectedTrack(trackId);
  };

  // Extract unique genres for keywords
  const uniqueGenres = new Set<string>();
  topArtists.forEach(artist => {
    if (!artist) return; // Skip null artists
    
    // Use optional chaining and type assertion to safely access genres
    const genres = (artist as any)?.genres;
    if (genres && Array.isArray(genres)) {
      genres.forEach(genre => uniqueGenres.add(genre));
    }
  });

  // Enhanced keywords for home page including dynamic data
  const enhancedKeywords = [
    'greek urban music',
    'greek trap',
    'greek hip hop',
    'greek rap',
    'greek drill',
    'urban greece',
    'greek music platform',
    'greek hot artists',
    'popular greek artists',
    'greek rap playlists',
    'trending greek songs',
    'greek music streaming',
    'greek music charts',
    'top greek artists',
    'top greek songs',
    ...Array.from(uniqueGenres).map(genre => `greek ${genre}`),
    ...topArtists.filter(artist => artist && artist.name).map(artist => artist.name),
    ...topTracks.filter(track => track && track.name).map(track => track.name)
  ].join(', ');

  // Prepare structured data for the homepage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://urbangreece.com/#website',
    'name': 'Urban Greece',
    'url': 'https://urbangreece.com',
    'description': 'Urban Greece: Ελληνική trap & hip-hop μουσική, κουλτούρα και lifestyle. Ανακάλυψε καλλιτέχνες, stories, events & αποκλειστικό περιεχόμενο.',
    'inLanguage': 'el-GR',
    'availableLanguage': [
      {
        '@type': 'Language',
        'name': 'Greek',
        'alternateName': 'el'
      },
      {
        '@type': 'Language',
        'name': 'English',
        'alternateName': 'en'
      }
    ],
    'publisher': {
      '@type': 'Organization',
      'name': 'Urban Greece',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://urbangreece.com/assets/images/logo.webp'
      }
    },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Top Artists',
          'url': 'https://urbangreece.com/hot-artists'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Top Songs',
          'url': 'https://urbangreece.com/songs'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Discover',
          'url': 'https://urbangreece.com/discover'
        }
      ]
    }
  };

  // Set critical meta tags directly for better homepage SEO
  useEffect(() => {
    // Set the title - most important for SEO
    document.title = "Urban Greece | Ό,τι συμβαίνει στo Ελληνικό Trap Industry";
    const description = 'Urban Greece: Η #1 σελίδα για την Ελληνική trap & hip-hop μουσική, κουλτούρα και lifestyle. Ανακάλυψε καλλιτέχνες...'
    // Set critical meta tags for homepage
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: enhancedKeywords },
      { property: 'og:title', content: 'Urban Greece | Ό,τι συμβαίνει στo Ελληνικό Trap Industry' },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://urbangreece.com' },
      { property: 'og:image', content: 'https://urbangreece.com/assets/images/icon.webp' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Urban Greece | Ό,τι συμβαίνει στo Ελληνικό Trap Industry' },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: 'https://urbangreece.com/assets/images/icon.webp' }
    ];
    
    // Add or update meta tags
    metaTags.forEach(({ name, property, content }) => {
      let meta = document.querySelector(`meta[${name ? 'name="'+name+'"' : 'property="'+property+'"'}]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://urbangreece.com');
    
    // Add hreflang tags for language alternatives
    const hreflangs = [
      { hreflang: 'el', href: 'https://urbangreece.com/' },
      { hreflang: 'en', href: 'https://urbangreece.com/en/' },
      { hreflang: 'x-default', href: 'https://urbangreece.com/' }
    ];
    
    hreflangs.forEach(({ hreflang, href }) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    });
    
    // Add structured data
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    
    // Just use the structured data directly without recreating availableLanguage
    script.textContent = JSON.stringify(structuredData);
    
    // Cleanup on unmount
    return () => {
      // No need to clean up as this is the homepage and other pages will set their own tags
    };
  }, [enhancedKeywords, structuredData]);
  
  return (
    <Layout>
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Urban Greece | Ό,τι συμβαίνει στo Ελληνικό Trap Industry</h1>
          <p className="text-xl max-w-2xl mx-auto">
            ⚡It's more than music. It's about the culture⚡
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2 text-xl text-gray-300">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading music data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg border border-red-800">
            <p>{error}</p>
            <Button 
              variant="outline"
              className="mt-4 border-red-700 text-red-400 hover:bg-red-900/30"
              onClick={() => refreshData()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {isFromHardcodedData && (
              <div className="mb-8 p-4 bg-amber-900/30 border border-amber-800 rounded-lg flex items-center">
                <AlertTriangle className="h-6 w-6 text-amber-400 mr-3 flex-shrink-0" />
                <div className="text-amber-300 text-sm flex-grow">
                  <p>
                    <strong>Note:</strong> Unable to retrieve live data from the database.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-4 border-amber-700 text-amber-400 hover:bg-amber-900/50"
                  onClick={() => refreshData()}
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Hot Artists</h2>
                </div>
                <Link to="/hot-artists">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topArtists.length > 0 ? (
                  topArtists.filter(artist => artist && artist.id).map((artist, index) => (
                    <ArtistCard 
                      key={artist.id} 
                      artist={artist} 
                      rank={index + 1}
                      showRank={true}
                    />
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10 text-gray-400">
                    <p>No artists found in database.</p>
                  </div>
                )}
              </div>
            </div>

            <FeaturedEvents />

            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Music className="mr-2 h-5 w-5 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Most Streamed Songs</h2>
                </div>
                <Link to="/songs">
                  <Button variant="outline" className="border-indigo-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {topTracks.length > 0 ? (
                  topTracks.filter(track => track && track.id).map((track, index) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      rank={index + 1} 
                      onPlay={handlePlayTrack}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>No tracks found in database.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Spotify Player Modal */}
      <SpotifyPlayer
        trackId={selectedTrack || ''}
        isOpen={!!selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </Layout>
  );
};

export default HomePage;
