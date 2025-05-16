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
  const structuredData = useMemo(() => {
    // Common properties for both languages
    const commonData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': 'https://urbangreece.com/discover',
      numberOfItems: totalArtists,
      genre: defaultGenres,
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
            genre: defaultGenres
          }
        }))
      },
      // Add search action
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://urbangreece.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };

    // Language-specific properties
    if (language === 'el') {
      return {
        ...commonData,
        name: 'Ανερχόμενοι Καλλιτέχνες & Newcomers | Urban Greece',
        description: `Ανακαλύψτε ${totalArtists} ανερχόμενους καλλιτέχνες στην ελληνική urban μουσική σκηνή. Από νέα ταλέντα μέχρι καθιερωμένους καλλιτέχνες στην ελληνική trap και hip hop.`,
        about: {
          '@type': 'Thing',
          name: 'Ελληνική Urban Μουσική',
          description: 'Η σύγχρονη ελληνική urban μουσική σκηνή, συμπεριλαμβανομένων των ανερχόμενων καλλιτεχνών σε trap, hip-hop και σύγχρονη ελληνική μουσική.'
        },
        alternateNames: greekTerms,
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
        }
      };
    } else {
      return {
        ...commonData,
        name: 'Emerging Artists & Greek Newcomers | Urban Greece',
        description: `Discover ${totalArtists} emerging artists in the Greek urban music scene. From new talents to established artists in Greek trap and hip hop.`,
        about: {
          '@type': 'Thing',
          name: 'Greek Urban Music',
          description: 'The contemporary Greek urban music scene, including emerging artists in trap, hip-hop, and modern Greek music.'
        },
        alternateNames: ['emerging greek artists', 'greek newcomers', 'rising greek talents'],
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
                name: 'Emerging Artists'
              }
            }
          ]
        }
      };
    }
  }, [language, totalArtists, allArtists, defaultGenres, greekTerms]);

  // Get the most recent updated timestamp for SEO
  const publishedTimestamp = useMemo(() => {
    if (allArtists.length === 0) return new Date().toISOString();
    
    // Find the first artist with a last_updated field, or use current date
    const artistWithTimestamp = allArtists.find(artist => artist.last_updated);
    return artistWithTimestamp?.last_updated || new Date().toISOString();
  }, [allArtists]);

  // SEO keywords based on current language
  const seoKeywords = useMemo(() => {
    // Base keywords for both languages
    const baseKeywords = [
      'urban greece',
      'greek music',
      'greek urban music',
      ...defaultGenres.map(genre => `greek ${genre}`),
      ...allArtists.slice(0, 10).map(artist => artist.name),
    ];

    // Additional language-specific keywords
    if (language === 'el') {
      return [
        ...baseKeywords,
        'ανερχόμενοι καλλιτέχνες',
        'ανερχόμενοι ράπερς',
        'νέοι καλλιτέχνες',
        'νέα ταλέντα',
        'νέα ελληνική τραπ',
        'ανερχόμενη ελληνική σκηνή',
        ...defaultGenres.map(genre => `ελληνικό ${genre}`),
      ];
    } else {
      return [
        ...baseKeywords,
        'emerging greek artists',
        'greek newcomers',
        'rising greek talents',
        'new greek artists',
        'greek music discovery',
        'greek music streaming',
      ];
    }
  }, [language, allArtists, defaultGenres]);

  return (
    <>
      <SEO
        title={t('discover.seo.title', 'Emerging Artists 2023 | Newcomers Greece | Rising Talents')}
        description={t('discover.seo.description', `Discover the top ${totalArtists} emerging artists in the Greek urban music scene. New talents in trap and hip hop, with listener statistics and rankings.`)}
        type="website"
        keywords={seoKeywords}
        section={t('discover.seo.section', 'Emerging Artists')}
        category="Music Directory"
        tags={[...defaultGenres, ...(language === 'el' ? greekTerms : [])]}
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