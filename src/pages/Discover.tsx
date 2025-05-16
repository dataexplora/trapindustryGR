import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { User, SlidersHorizontal, Users, Loader2, Sparkles, Filter, Clock, ArrowUp, TrendingUp, Star } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { Button } from '@/components/ui/button';
import { useDiscoverArtists } from '@/hooks/useDiscoverArtists';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const Discover = () => {
  const { allArtists, totalArtists, isLoading, error, refreshData } = useDiscoverArtists();
  const [minListeners, setMinListeners] = useState(10000);
  const [maxListeners, setMaxListeners] = useState(250000);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterView, setFilterView] = useState<'all' | 'emerging' | 'rising'>('emerging');
  const { t, language } = useLanguage();

  // Filter artists while preserving their global ranks
  const filteredArtists = useMemo(() => {
    let filtered = allArtists.filter(artist => 
      artist.monthly_listeners !== undefined && 
      artist.monthly_listeners >= minListeners
    );
    
    // Apply max listeners filter if viewing emerging artists
    if (filterView !== 'all' && maxListeners) {
      filtered = filtered.filter(artist => 
        artist.monthly_listeners !== undefined && 
        artist.monthly_listeners <= maxListeners
      );
    }
    
    // Sort by monthly_listeners but preserve original rank
    return [...filtered].sort((a, b) => {
      const aValue = a.monthly_listeners || 0;
      const bValue = b.monthly_listeners || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [allArtists, minListeners, maxListeners, sortDirection, filterView]);

  const handleFilterChange = (view: 'all' | 'emerging' | 'rising') => {
    setFilterView(view);
    if (view === 'emerging') {
      setMinListeners(10000); // Explicitly set to 10k for emerging artists
      setMaxListeners(250000);
      setSortDirection('asc');
    } else if (view === 'rising') {
      setMinListeners(100000);
      setMaxListeners(500000);
      setSortDirection('asc');
    } else {
      setMinListeners(0);
      setMaxListeners(Infinity);
      setSortDirection('desc');
    }
  };

  // Enhanced genres array with Greek terms for emerging artists
  const defaultGenres = [
    'trap', 'hip hop', 'rap', 'urban', 'drill', 'pop', 'electronic',
    'r&b', 'underground', 'alternative', 'indie'
  ];

  // Greek terms for emerging artists and newcomers
  const greekTerms = [
    'ανερχόμενοι καλλιτέχνες', 
    'ανερχόμενοι ράπερς', 
    'ανερχόμενοι τράπερς',
    'νέοι καλλιτέχνες',
    'νέα ταλέντα',
    'newcomers greece',
    'emerging greek artists',
    'ανερχόμενη μουσική σκηνή',
    'νέα ελληνική τραπ',
    'νέα ελληνική σκηνή'
  ];

  // Structured data for music search
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://urbangreece.com/discover',
    name: 'Ανερχόμενοι Καλλιτέχνες & Newcomers | Urban Greece',
    description: `Ανακαλύψτε ${totalArtists} ανερχόμενους καλλιτέχνες στην ελληνική urban μουσική σκηνή. Από νέα ταλέντα μέχρι καθιερωμένους καλλιτέχνες στην ελληνική trap και hip hop.`,
    about: {
      '@type': 'Thing',
      name: 'Ελληνική Urban Μουσική',
      description: 'Η σύγχρονη ελληνική urban μουσική σκηνή, συμπεριλαμβανομένων των ανερχόμενων καλλιτεχνών σε trap, hip-hop και σύγχρονη ελληνική μουσική.'
    },
    numberOfItems: totalArtists,
    genre: defaultGenres,
    // Add alternateNames for Greek terms
    alternateNames: greekTerms,
    // Add breadcrumb
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': 'https://urbangreece.com',
            name: 'Urban Greece'
          }
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': 'https://urbangreece.com/discover',
            name: 'Ανερχόμενοι Καλλιτέχνες'
          }
        }
      ]
    },
    // Add search action
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://urbangreece.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    // Add featured artists
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: allArtists.slice(0, 10).map((artist, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicGroup',
          '@id': `https://urbangreece.com/artist/${artist.id}`,
          name: artist.name,
          // Use avatar image from images object
          image: artist.images?.avatar || '',
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/ListenAction',
              userInteractionCount: artist.monthly_listeners || 0,
              name: 'Monthly Listeners'
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/FollowAction',
              userInteractionCount: artist.followers || 0,
              name: 'Followers'
            }
          ],
          // Use default genre since we don't have genre data
          genre: defaultGenres
        }
      }))
    }
  };

  // Enhanced keywords for discovery including Greek terms
  const enhancedKeywords = [
    // Greek terms for emerging artists
    'ανερχόμενοι καλλιτέχνες',
    'ανερχόμενοι ράπερς',
    'ανερχόμενοι τράπερς',
    'νέοι καλλιτέχνες',
    'νέα ταλέντα',
    'newcomers greece',
    'νέα ελληνική τραπ',
    'ανερχόμενη ελληνική σκηνή',
    'ανερχόμενοι έλληνες μουσικοί',

    // English terms
    'emerging greek artists',
    'greek newcomers',
    'rising greek talents',
    'new greek artists',
    'greek music',
    'greek urban music',
    'greek trap',
    'greek hip hop',
    'greek music discovery',
    'greek music streaming',
    'greek music charts',
    'greek music rankings',
    
    // Genre combinations with Greek terms
    ...defaultGenres.map(genre => `ελληνικό ${genre}`),
    ...defaultGenres.map(genre => `greek ${genre}`),
    ...defaultGenres.map(genre => `${genre} ανερχόμενοι`),
    ...defaultGenres.map(genre => `${genre} music greece`),
    
    // Artist names
    ...allArtists.slice(0, 10).map(artist => artist.name),
    
    // Brand terms
    'urban greece',
    'greek music platform',
    'greek music statistics',
    'monthly listeners greece',
    'greek music followers'
  ];

  // Get the most recent updated timestamp for SEO
  const publishedTimestamp = useMemo(() => {
    if (allArtists.length === 0) return new Date().toISOString();
    
    // Find the first artist with a last_updated field, or use current date
    const artistWithTimestamp = allArtists.find(artist => artist.last_updated);
    return artistWithTimestamp?.last_updated || new Date().toISOString();
  }, [allArtists]);

  return (
    <>
      <SEO
        title={t('discover.seo.title', 'Ανερχόμενοι Καλλιτέχνες 2023 | Newcomers Greece | Ανερχόμενοι Ράπερς')}
        description={t('discover.seo.description', `Ανακαλύψτε τους ${totalArtists} κορυφαίους ανερχόμενους καλλιτέχνες της ελληνικής urban σκηνής. Νέα ταλέντα στην trap και hip hop, με στατιστικά ακροατών και κατάταξη. Η πιο ενημερωμένη λίστα με νέους Έλληνες καλλιτέχνες.`)}
        type="website"
        keywords={enhancedKeywords}
        section={t('discover.seo.section', 'Ανερχόμενοι Καλλιτέχνες')}
        category="Music Directory"
        tags={[...defaultGenres, ...greekTerms]}
        structuredData={structuredData}
        publishedAt={publishedTimestamp}
        updatedAt={new Date().toISOString()}
      />

      <Layout>
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center mb-4">
              <Sparkles className="mr-3 h-7 w-7 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">
                {t('discover.title', 'Discover Greek Urban Music')}
              </h1>
            </div>
            <p className="text-lg max-w-3xl text-gray-200 mb-6">
              {t('discover.subtitle', 'Explore the latest tracks, trending artists, and influential releases shaping Greek urban culture')}
            </p>
          
            <div className="flex flex-wrap gap-2 mt-6">
              <Button 
                variant={filterView === 'emerging' ? "default" : "outline"} 
                className={filterView === 'emerging' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('emerging')}
              >
                <Star className="h-4 w-4 mr-1" />
                {t('discover.filter.emerging', 'New Talents')}
              </Button>
              <Button 
                variant={filterView === 'rising' ? "default" : "outline"} 
                className={filterView === 'rising' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('rising')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                {t('discover.filter.rising', 'Rising Stars')}
              </Button>
              <Button 
                variant={filterView === 'all' ? "default" : "outline"} 
                className={filterView === 'all' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                <Users className="h-4 w-4 mr-1" />
                {t('discover.filter.all', 'All Artists')}
              </Button>
              
              <div className="ml-auto flex items-center gap-1 text-gray-300 text-sm">
                <SlidersHorizontal className="h-3 w-3" />
                <span>{t('discover.filter.listeners', 'Monthly Listeners')}:</span>
                <span className="font-medium text-white">
                  {formatNumber(minListeners)}
                  {maxListeners < Infinity ? ' - ' + formatNumber(maxListeners) : '+'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center text-gray-400">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('discover.loading', 'Loading artists...')}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{t('discover.error', 'Error loading artists')}</p>
              <Button 
                onClick={() => refreshData()} 
                variant="outline"
                className="border-indigo-500 text-indigo-400 hover:bg-indigo-950"
              >
                {t('discover.retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {filteredArtists.map(artist => (
                  <ArtistCard 
                    key={artist.id} 
                    artist={artist} 
                  />
                ))}
              </div>
              
              {filteredArtists.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">{t('discover.noResults', 'No results found')}</p>
                  <Button 
                    onClick={() => handleFilterChange('all')} 
                    variant="outline"
                    className="border-indigo-500 text-indigo-400 hover:bg-indigo-950"
                  >
                    {t('discover.showAll', 'Show All Artists')}
                  </Button>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <p className="text-gray-500 text-sm">
                  {t('discover.stats', 'Showing {0} of {1} artists', filteredArtists.length, totalArtists)}
                </p>
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Discover; 