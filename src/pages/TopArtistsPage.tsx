import React, { useState, useEffect } from 'react';
import { ArtistWithImages, artistService } from '../services/artistService';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import { formatNumber } from '../utils/format';

const TopArtistsPage = () => {
  const [artists, setArtists] = useState<ArtistWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10); // Default limit to 10 top artists

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await artistService.getTopArtists(limit);
        setArtists(data);
      } catch (err) {
        console.error('Error fetching top artists:', err);
        setError('Failed to load hot artists. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopArtists();
  }, [limit]);

  // Extract unique genres for keywords
  const uniqueGenres = new Set<string>();
  artists.forEach(artist => {
    // Use optional chaining and type assertion to safely access genres
    const genres = (artist as any).genres;
    if (genres && Array.isArray(genres)) {
      genres.forEach(genre => uniqueGenres.add(genre));
    }
  });

  // Calculate total monthly listeners and followers
  const totalMonthlyListeners = artists.reduce((sum, artist) => sum + (artist.monthly_listeners || 0), 0);
  const totalFollowers = artists.reduce((sum, artist) => sum + (artist.followers || 0), 0);

  // Prepare structured data for top artists
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://urbangreece.com/hot-artists',
    'name': 'Top Greek Urban Artists - Urban Greece',
    'description': `Discover the ${limit} most popular Greek artists in urban music. Rankings based on streaming data and social media following.`,
    'inLanguage': 'el-GR',
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': artists.length,
      'itemListElement': artists.map((artist, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'MusicGroup',
          '@id': `https://urbangreece.com/artist/${artist.id}`,
          'name': artist.name,
          'image': artist.images?.avatar || '',
          'interactionStatistic': [
            {
              '@type': 'InteractionCounter',
              'interactionType': 'https://schema.org/ListenAction',
              'userInteractionCount': artist.monthly_listeners || 0,
              'name': 'Monthly Listeners'
            },
            {
              '@type': 'InteractionCounter',
              'interactionType': 'https://schema.org/FollowAction',
              'userInteractionCount': artist.followers || 0,
              'name': 'Followers'
            }
          ]
        }
      }))
    }
  };

  // Enhanced keywords for top artists page
  const enhancedKeywords = [
    'top greek artists',
    'hot greek artists',
    'popular greek artists',
    'greek trap artists',
    'greek hip hop artists',
    'greek rap artists',
    'greek music ranking',
    'urban greece artists',
    'best greek music artists',
    'trending greek musicians',
    ...Array.from(uniqueGenres).map(genre => `top greek ${genre} artists`),
    ...artists.slice(0, 5).map(artist => artist.name)
  ];
  
  return (
    <>
      <SEO
        title={`Top ${limit} Greek Urban Artists | Popular Rappers & Hip Hop Musicians`}
        description={`Explore the ${limit} most popular Greek urban artists with a combined ${formatNumber(totalMonthlyListeners)} monthly listeners. Updated rankings of the hottest names in Greek trap, hip-hop and rap.`}
        type="website"
        keywords={enhancedKeywords}
        section="Hot Artists"
        category="Music Artists"
        tags={Array.from(uniqueGenres)}
        structuredData={structuredData}
        updatedAt={new Date().toISOString()}
      />
      
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Hot Artists</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Show:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-dark-card border border-dark-border text-white rounded-md px-3 py-1"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse-subtle text-xl text-gray-300">Loading hot artists...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
              >
                Try Again
              </button>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No artists found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artists.map((artist, index) => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  rank={index + 1} 
                  showRank={true} 
                />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default TopArtistsPage; 