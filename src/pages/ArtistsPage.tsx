import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import { User, SlidersHorizontal, Users, Loader2, Sparkles, Filter, Clock, ArrowUp, TrendingUp, Star } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { Button } from '@/components/ui/button';
import { useDiscoverArtists } from '@/hooks/useDiscoverArtists';
import SEO from '../components/SEO';

const ArtistsPage = () => {
  const { allArtists, totalArtists, isLoading, error, refreshData } = useDiscoverArtists();
  const [minListeners, setMinListeners] = useState(10000);
  const [maxListeners, setMaxListeners] = useState(250000);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterView, setFilterView] = useState<'all' | 'emerging' | 'rising'>('emerging');

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
        title={`Ανερχόμενοι Καλλιτέχνες 2023 | Newcomers Greece | Ανερχόμενοι Ράπερς`}
        description={`Ανακαλύψτε τους ${totalArtists} κορυφαίους ανερχόμενους καλλιτέχνες της ελληνικής urban σκηνής. Νέα ταλέντα στην trap και hip hop, με στατιστικά ακροατών και κατάταξη. Η πιο ενημερωμένη λίστα με νέους Έλληνες καλλιτέχνες.`}
        type="website"
        keywords={enhancedKeywords}
        section="Ανερχόμενοι Καλλιτέχνες"
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
              <h1 className="text-4xl font-bold text-white">Ανερχόμενοι Καλλιτέχνες | Newcomers Greece</h1>
            </div>
            <p className="text-lg max-w-3xl text-gray-200 mb-6">
              Ανακαλύψτε την ζωντανή ελληνική urban σκηνή και γνωρίστε τους επόμενους μεγάλους καλλιτέχνες πριν γίνουν γνωστοί. Όλοι οι ανερχόμενοι ράπερς και τράπερς σε ένα μέρος.
            </p>
          
            <div className="flex flex-wrap gap-2 mt-6">
              <Button 
                variant={filterView === 'emerging' ? "default" : "outline"} 
                className={filterView === 'emerging' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('emerging')}
              >
                <Star className="h-4 w-4 mr-1" />
                Νέα Ταλέντα
              </Button>
              <Button 
                variant={filterView === 'rising' ? "default" : "outline"} 
                className={filterView === 'rising' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('rising')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Ανερχόμενοι
              </Button>
              <Button 
                variant={filterView === 'all' ? "default" : "outline"} 
                className={filterView === 'all' ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-400 text-indigo-200"}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                <Users className="h-4 w-4 mr-1" />
                Όλοι οι Καλλιτέχνες
              </Button>
            </div>
          </div>
        </div>
      
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6 bg-dark-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-300">
                {filteredArtists.length} από {totalArtists} καλλιτέχνες
                {minListeners > 0 && ` με ${formatNumber(minListeners)}+`}
                {maxListeners < Infinity && ` έως ${formatNumber(maxListeners)}`} μηνιαίους ακροατές
              </span>
            </div>
          
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-gray-400 text-sm mr-2">Ταξινόμηση:</span>
                <Button
                  variant="outline"
                  size="sm" 
                  className="h-8 border-gray-700 text-gray-300"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? (
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>Ανερχόμενοι Πρώτα</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1 transform rotate-180" />
                      <span>Δημοφιλείς Πρώτα</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2 text-xl text-gray-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Φόρτωση καλλιτεχνών...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
              >
                Δοκιμάστε Ξανά
              </button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>Δε βρέθηκαν καλλιτέχνες που να ταιριάζουν με το τρέχον φίλτρο.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                {filterView === 'emerging' && (
                  <div className="bg-gradient-to-r from-indigo-900/30 to-transparent p-4 rounded-lg mb-6 border border-indigo-800/50">
                    <h2 className="text-lg font-medium text-indigo-300 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                      Νέα Ταλέντα στο Προσκήνιο
                    </h2>
                    <p className="text-gray-300">
                      Ανακαλύψτε το επόμενο κύμα Ελλήνων urban καλλιτεχνών που ανεβαίνουν. Αυτά τα νέα ταλέντα αντιπροσωπεύουν το μέλλον της σκηνής.
                    </p>
                  </div>
                )}
                {filterView === 'rising' && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-transparent p-4 rounded-lg mb-6 border border-purple-800/50">
                    <h2 className="text-lg font-medium text-purple-300 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-yellow-400" />
                      Ανερχόμενοι Αστέρες
                    </h2>
                    <p className="text-gray-300">
                      Αυτοί οι καλλιτέχνες κάνουν αίσθηση και χτίζουν σημαντικό κοινό. Βρίσκονται σε θέση να ξεχωρίσουν στη mainstream σκηνή σύντομα.
                    </p>
                  </div>
                )}
              </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredArtists.map((artist) => (
                  <ArtistCard 
                    key={artist.id} 
                    artist={artist} 
                    rank={artist.rank}
                    // Always show rank since it's now global
                    showRank={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default ArtistsPage;
