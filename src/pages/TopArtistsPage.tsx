import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArtistWithImages, artistService } from '../services/artistService';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { TrendingUp, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { formatNumber } from '../utils/format';
import { useLanguage } from '../contexts/LanguageContext';

const TopArtistsPage = () => {
  const [artists, setArtists] = useState<ArtistWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10); // Default limit to 10 top artists
  const { t, language } = useLanguage();

  // Memoized data fetching function to prevent unnecessary recreations
  const fetchTopArtists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await artistService.getTopArtists(limit);
      setArtists(data);
    } catch (err) {
      console.error('Error fetching top artists:', err);
      setError(t('top.error', 'Failed to load hot artists. Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  }, [limit, t]);

  // Only fetch artists when limit changes, not when language changes
  useEffect(() => {
    fetchTopArtists();
  }, [limit, fetchTopArtists]);

  // Extract unique genres for keywords - memoized to avoid recalculation on every render
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    artists.forEach(artist => {
      // Use optional chaining and type assertion to safely access genres
      const artistGenres = (artist as any).genres;
      if (artistGenres && Array.isArray(artistGenres)) {
        artistGenres.forEach(genre => genres.add(genre));
      }
    });
    return genres;
  }, [artists]);

  // Calculate total monthly listeners and followers - memoized
  const statistics = useMemo(() => {
    const totalMonthlyListeners = artists.reduce((sum, artist) => sum + (artist.monthly_listeners || 0), 0);
    const totalFollowers = artists.reduce((sum, artist) => sum + (artist.followers || 0), 0);
    return { totalMonthlyListeners, totalFollowers };
  }, [artists]);

  // Prepare structured data for top artists - memoized
  const structuredData = useMemo(() => ({
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
  }), [artists, limit]);

  // Enhanced keywords for top artists page - memoized
  const enhancedKeywords = useMemo(() => [
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
  ], [uniqueGenres, artists]);
  
  return (
    <>
      <SEO
        title={`Top ${limit} Greek Urban Artists | Popular Rappers & Hip Hop Musicians`}
        description={`Explore the ${limit} most popular Greek urban artists with a combined ${formatNumber(statistics.totalMonthlyListeners)} monthly listeners. Updated rankings of the hottest names in Greek trap, hip-hop and rap.`}
        type="website"
        keywords={enhancedKeywords}
        section={t('top.section', 'Hot Artists')}
        category={t('top.category', 'Music Artists')}
        tags={Array.from(uniqueGenres)}
        structuredData={structuredData}
        updatedAt={new Date().toISOString()}
      />
      
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">{t('top.title', 'Hot Artists')}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">{t('top.show', 'Show')}:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-dark-card border border-dark-border text-white rounded-md px-3 py-1"
              >
                <option value={10}>{t('top.limit.10', 'Top 10')}</option>
                <option value={20}>{t('top.limit.20', 'Top 20')}</option>
                <option value={50}>{t('top.limit.50', 'Top 50')}</option>
                <option value={100}>{t('top.limit.100', 'Top 100')}</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center text-gray-300">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('top.loading', 'Loading hot artists...')}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => fetchTopArtists()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
              >
                {t('top.tryAgain', 'Try Again')}
              </button>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>{t('top.noArtists', 'No artists found in the database.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artists.map((artist, index) => (
                <ArtistCard 
                  key={`${artist.id}-${language}`} 
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