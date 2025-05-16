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

  return (
    <>
      <SEO
        title={t('discover.seo.title', 'Emerging Artists 2023 | Newcomers Greece | Rising Talents')}
        description={t('discover.seo.description', `Discover the top ${totalArtists} emerging artists in the Greek urban music scene. New talents in trap and hip hop, with listener statistics and rankings.`)}
        type="website"
        section={t('discover.seo.section', 'Emerging Artists')}
        category="Music Directory"
      />
      <Layout>
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center mb-4">
              <Sparkles className="mr-3 h-7 w-7 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">{t('discover.title', 'Discover Greek Urban Music')}</h1>
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
            </div>
          </div>
        </div>
        
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6 bg-dark-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-300">
                {t('discover.stats', 'Showing {0} of {1} artists', filteredArtists.length, totalArtists)}
                {minListeners > 0 && ` ${t('discover.stats.with', 'with')} ${formatNumber(minListeners)}+`}
                {maxListeners < Infinity && ` ${t('discover.stats.to', 'to')} ${formatNumber(maxListeners)}`} 
                {t('discover.filter.listeners', 'monthly listeners')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-gray-400 text-sm mr-2">{t('discover.sort.label', 'Sort')}:</span>
                <Button
                  variant="outline"
                  size="sm" 
                  className="h-8 border-gray-700 text-gray-300"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? (
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>{t('discover.sort.emerging', 'Emerging First')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1 transform rotate-180" />
                      <span>{t('discover.sort.popular', 'Popular First')}</span>
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
                <span>{t('discover.loading', 'Loading artists...')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => refreshData()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
              >
                {t('discover.retry', 'Retry')}
              </button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>{t('discover.noResults', 'No results found')}</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                {filterView === 'emerging' && (
                  <div className="bg-gradient-to-r from-indigo-900/30 to-transparent p-4 rounded-lg mb-6 border border-indigo-800/50">
                    <h2 className="text-lg font-medium text-indigo-300 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                      {t('discover.emerging.title', 'Emerging Talent Spotlight')}
                    </h2>
                    <p className="text-gray-300">
                      {t('discover.emerging.description', 'Discover the next wave of Greek urban artists on the rise. These emerging talents represent the future of the scene.')}
                    </p>
                  </div>
                )}
                {filterView === 'rising' && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-transparent p-4 rounded-lg mb-6 border border-purple-800/50">
                    <h2 className="text-lg font-medium text-purple-300 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-yellow-400" />
                      {t('discover.rising.title', 'Rising Stars')}
                    </h2>
                    <p className="text-gray-300">
                      {t('discover.rising.description', 'These artists are making waves and building significant audiences. They\'re positioned to break into the mainstream soon.')}
                    </p>
                  </div>
                )}
                {filterView === 'all' && (
                  <div className="bg-gradient-to-r from-gray-800/30 to-transparent p-4 rounded-lg mb-6 border border-gray-700/50">
                    <h2 className="text-lg font-medium text-gray-300 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-yellow-400" />
                      {t('discover.all.title', 'All Greek Urban Artists')}
                    </h2>
                    <p className="text-gray-300">
                      {t('discover.all.description', 'Browse the complete collection of Greek urban artists, from underground talents to mainstream stars.')}
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

export default Discover;
