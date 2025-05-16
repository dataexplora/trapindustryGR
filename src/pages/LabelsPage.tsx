import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Label, labelService } from '../services/labelService';
import { Disc3, Album, Users, Calendar, BarChart3, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber } from '../utils/format';

const LabelsPage = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [labelAlbums, setLabelAlbums] = useState<any[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await labelService.getAllLabels();
        setLabels(data);
        
        // Select the first label by default if there is one
        if (data && data.length > 0) {
          setSelectedLabel(data[0].name);
        }
      } catch (err: any) {
        console.error('Error fetching labels:', err);
        setError(err.message || 'Failed to load labels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLabels();
  }, []);
  
  useEffect(() => {
    const fetchLabelAlbums = async () => {
      if (!selectedLabel) return;
      
      try {
        setIsLoadingAlbums(true);
        const albums = await labelService.getLabelAlbums(selectedLabel);
        setLabelAlbums(albums);
      } catch (err) {
        console.error(`Error fetching albums for ${selectedLabel}:`, err);
      } finally {
        setIsLoadingAlbums(false);
      }
    };
    
    fetchLabelAlbums();
  }, [selectedLabel]);
  
  // Find the currently selected label object
  const currentLabel = labels.find(label => label.name === selectedLabel);
  
  // Count total albums and artists across all labels
  const totalAlbums = labels.reduce((sum, label) => sum + label.album_count, 0);
  const totalArtists = new Set(labels.flatMap(label => Array.from(label.artist_ids || []))).size || 
    labels.reduce((sum, label) => sum + label.artist_count, 0);
  
  // Calculate market share percentages
  const getMarketSharePercentage = (label: Label) => {
    if (!totalAlbums) return 0;
    return (label.album_count / totalAlbums) * 100;
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Prepare structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://urbangreece.com/labels',
    'name': language === 'el' ? 'Δισκογραφικές Εταιρείες στην Ελληνική Urban Σκηνή' : 'Record Labels in Greek Urban Music',
    'description': language === 'el' 
      ? `Ανακαλύψτε τις κορυφαίες δισκογραφικές εταιρείες που διαμορφώνουν την ελληνική urban μουσική με ${totalAlbums} κυκλοφορίες από ${totalArtists} καλλιτέχνες.`
      : `Discover the top record labels shaping Greek urban music with ${totalAlbums} releases from ${totalArtists} artists.`,
    'inLanguage': language === 'el' ? 'el-GR' : 'en-US',
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': labels.length,
      'itemListElement': labels.slice(0, 10).map((label, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Organization',
          'name': label.name,
          'description': `${label.album_count} releases, ${label.artist_count} artists`
        }
      }))
    }
  };
  
  return (
    <>
      <SEO
        title={language === 'el' 
          ? 'Δισκογραφικές Εταιρείες | Ελληνική Urban Μουσική | Urban Greece'
          : 'Record Labels | Greek Urban Music | Urban Greece'
        }
        description={language === 'el'
          ? `Ανακαλύψτε τις κορυφαίες δισκογραφικές εταιρείες που διαμορφώνουν την ελληνική urban μουσική με ${totalAlbums} κυκλοφορίες από ${totalArtists} καλλιτέχνες.`
          : `Discover the top record labels shaping Greek urban music with ${totalAlbums} releases from ${totalArtists} artists.`
        }
        type="website"
        keywords={language === 'el' 
          ? ['δισκογραφικές εταιρείες', 'ελληνική trap', 'ελληνικό hip hop', 'urban μουσική', 'δισκογραφίες', 'labels', 'ελληνική μουσική βιομηχανία']
          : ['greek record labels', 'greek trap labels', 'greek hip hop industry', 'urban music companies', 'greek music industry', 'indie labels greece']
        }
        section={t('labels.section', 'Record Labels')}
        category={t('labels.category', 'Music Industry')}
        structuredData={structuredData}
        updatedAt={new Date().toISOString()}
      />
      
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('labels.title', 'Record Labels')}
              </h1>
              <p className="text-gray-400 max-w-2xl">
                {t('labels.subtitle', 'The companies shaping the Greek urban music landscape and their impact on the industry.')}
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2 text-xl text-gray-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>{t('labels.loading', 'Loading label data...')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <Button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
              >
                {t('labels.tryAgain', 'Try Again')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Labels List */}
              <div className="lg:col-span-1">
                <div className="bg-dark-card rounded-lg p-4 h-full overflow-auto">
                  <h2 className="text-xl font-bold text-gray-200 mb-4">
                    {t('labels.list.title', 'Labels')} ({labels.length})
                  </h2>
                  
                  {/* Independent releases info */}
                  {labels.some(label => label.name === 'Independent') && (
                    <div className="bg-indigo-900/30 rounded-md p-3 mb-4 text-xs text-gray-300">
                      <p>
                        {t('labels.independent.banner', 'The "Independent" category includes releases where artists use their own name as a label.')}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {labels.map(label => (
                      <Card 
                        key={label.name}
                        className={`cursor-pointer hover:bg-dark-card-hover border-dark-border ${
                          selectedLabel === label.name ? 'bg-dark-card-hover border-indigo-600' : ''
                        } ${label.name === 'Independent' ? 'bg-indigo-900/20' : ''}`}
                        onClick={() => setSelectedLabel(label.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`font-semibold truncate ${label.name === 'Independent' ? 'text-indigo-400' : 'text-white'}`} title={label.name}>
                                {label.name === 'Independent' ? t('labels.independent.title', 'Independent') : label.name}
                              </h3>
                              <div className="flex items-center text-sm text-gray-400 mt-1">
                                <Album className="h-3.5 w-3.5 mr-1" />
                                <span>{label.album_count}</span>
                                <Users className="h-3.5 w-3.5 ml-3 mr-1" />
                                <span>{label.artist_count}</span>
                              </div>
                            </div>
                            <div 
                              className={`h-12 w-12 flex items-center justify-center rounded-full ${label.name === 'Independent' ? 'bg-indigo-700' : 'bg-indigo-800'}`}
                              title={t('labels.list.marketShare', 'Market Share')}
                            >
                              <span className="text-base font-semibold text-white">{getMarketSharePercentage(label).toFixed(1)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Label Details */}
              <div className="lg:col-span-2">
                {currentLabel ? (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-2 bg-dark-card border-dark-border mb-6">
                      <TabsTrigger value="overview">{t('labels.details.overview', 'Overview')}</TabsTrigger>
                      <TabsTrigger value="releases">{t('labels.details.releases', 'Releases')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6">
                      <Card className="bg-dark-card border-dark-border">
                        <CardHeader>
                          <CardTitle className="text-2xl">
                            {currentLabel.name === 'Independent' ? t('labels.independent.title', 'Independent') : currentLabel.name}
                            {currentLabel.name === 'Independent' && (
                              <span className="inline-block ml-2 text-xs px-2 py-1 bg-indigo-800 text-white rounded-full">
                                {t('labels.independent.tag', 'Self-released')}
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {currentLabel.name === 'Independent' ? (
                              t('labels.independent.description', 'Releases by artists without a traditional record label')
                            ) : (
                              language === 'el' 
                                ? `Κυκλοφορίες από ${currentLabel.earliest_release ? new Date(currentLabel.earliest_release).getFullYear() : '?'} έως ${currentLabel.latest_release ? new Date(currentLabel.latest_release).getFullYear() : '?'}`
                                : `Releases from ${currentLabel.earliest_release ? new Date(currentLabel.earliest_release).getFullYear() : '?'} to ${currentLabel.latest_release ? new Date(currentLabel.latest_release).getFullYear() : '?'}`
                            )}
                          </CardDescription>
                        </CardHeader>
                        
                        {currentLabel.name === 'Independent' && (
                          <div className="px-6 pt-2 pb-4">
                            <div className="bg-indigo-900/30 rounded-md p-3 mb-4 text-sm text-gray-300">
                              <p>
                                {t('labels.independent.info', 'This category includes releases where artists use their own name (or variations of it) as a label. This is common in the trap and hip-hop scene, where artists often release music independently.')}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-dark-card-hover border-dark-border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <Album className="h-5 w-5 text-indigo-400" />
                                  <span className="text-xs text-gray-400">{t('labels.stats.albums', 'Albums')}</span>
                                </div>
                                <div className="mt-2 text-2xl font-bold text-white">
                                  {formatNumber(currentLabel.album_count)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {getMarketSharePercentage(currentLabel).toFixed(1)}% {t('labels.stats.marketShare', 'market share')}
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-dark-card-hover border-dark-border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <Users className="h-5 w-5 text-indigo-400" />
                                  <span className="text-xs text-gray-400">{t('labels.stats.artists', 'Artists')}</span>
                                </div>
                                <div className="mt-2 text-2xl font-bold text-white">
                                  {formatNumber(currentLabel.artist_count)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {((currentLabel.artist_count / totalArtists) * 100).toFixed(1)}% {t('labels.stats.ofActiveArtists', 'of active artists')}
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-dark-card-hover border-dark-border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <Disc3 className="h-5 w-5 text-indigo-400" />
                                  <span className="text-xs text-gray-400">{t('labels.stats.tracks', 'Tracks')}</span>
                                </div>
                                <div className="mt-2 text-2xl font-bold text-white">
                                  {formatNumber(currentLabel.track_count)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {t('labels.stats.averageTracks', 'avg. {0}/album', (currentLabel.track_count / currentLabel.album_count).toFixed(1))}
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-dark-card-hover border-dark-border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <Calendar className="h-5 w-5 text-indigo-400" />
                                  <span className="text-xs text-gray-400">{t('labels.stats.activeYears', 'Active Years')}</span>
                                </div>
                                <div className="mt-2 text-2xl font-bold text-white">
                                  {currentLabel.release_years.length}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {currentLabel.release_years.sort().join(', ')}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">
                              {t('labels.stats.releaseTimeline', 'Release Timeline')}
                            </h3>
                            <div className="h-48 bg-dark-card-hover border border-dark-border rounded-lg flex items-center justify-center">
                              <div className="text-gray-400 text-center">
                                <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                                <p>{t('labels.stats.chartComingSoon', 'Release timeline visualization coming soon')}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">
                              {t('labels.stats.latestReleases', 'Latest Releases')}
                            </h3>
                            {isLoadingAlbums ? (
                              <div className="flex justify-center items-center h-32">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                              </div>
                            ) : labelAlbums.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {labelAlbums.slice(0, 4).map(album => (
                                  <Card key={album.id} className="bg-dark-card-hover border-dark-border overflow-hidden">
                                    <div className="flex p-3">
                                      <div className="w-16 h-16 mr-3 flex-shrink-0">
                                        {album.cover_url ? (
                                          <img 
                                            src={album.cover_url} 
                                            alt={album.name} 
                                            className="w-16 h-16 object-cover rounded-md"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 bg-dark-card rounded-md flex items-center justify-center">
                                            <Album className="h-6 w-6 text-gray-600" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white truncate" title={album.name}>
                                          {album.name}
                                        </h4>
                                        <Link to={`/artist/${album.artist_id}`} className="text-xs text-indigo-400 hover:text-indigo-300">
                                          {album.artist_name}
                                        </Link>
                                        <div className="text-xs text-gray-400 mt-1">
                                          {formatDate(album.release_date)}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t('labels.stats.noReleasesFound', 'No releases found for this label')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="releases">
                      <Card className="bg-dark-card border-dark-border">
                        <CardHeader>
                          <CardTitle>{t('labels.details.allReleases', 'All Releases')}</CardTitle>
                          <CardDescription>
                            {language === 'el' 
                              ? `${labelAlbums.length} κυκλοφορίες από την ${currentLabel.name}`
                              : `${labelAlbums.length} releases from ${currentLabel.name}`
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingAlbums ? (
                            <div className="flex justify-center items-center h-64">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                          ) : labelAlbums.length > 0 ? (
                            <div className="space-y-4">
                              {labelAlbums.map(album => (
                                <Card key={album.id} className="bg-dark-card-hover border-dark-border overflow-hidden">
                                  <div className="flex p-4">
                                    <div className="w-20 h-20 mr-4 flex-shrink-0">
                                      {album.cover_url ? (
                                        <img 
                                          src={album.cover_url} 
                                          alt={album.name} 
                                          className="w-20 h-20 object-cover rounded-md"
                                        />
                                      ) : (
                                        <div className="w-20 h-20 bg-dark-card rounded-md flex items-center justify-center">
                                          <Album className="h-8 w-8 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-md font-medium text-white" title={album.name}>
                                        {album.name}
                                      </h4>
                                      <Link to={`/artist/${album.artist_id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                                        {album.artist_name}
                                      </Link>
                                      <div className="flex items-center text-xs text-gray-400 mt-2">
                                        <div className="mr-4">
                                          <span className="font-medium">{formatDate(album.release_date)}</span>
                                        </div>
                                        <div className="mr-4 flex items-center">
                                          <Disc3 className="h-3.5 w-3.5 mr-1" />
                                          <span>
                                            {album.track_count} {album.track_count === 1 
                                              ? t('labels.stats.track', 'track') 
                                              : t('labels.stats.tracks', 'tracks')
                                            }
                                          </span>
                                        </div>
                                        <div className="capitalize flex items-center">
                                          <span className="px-2 py-0.5 rounded-full bg-dark-card text-xs">
                                            {album.album_type}
                                          </span>
                                        </div>
                                      </div>
                                      {album.share_url && (
                                        <div className="mt-3">
                                          <a 
                                            href={album.share_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs bg-green-900 hover:bg-green-800 text-green-100 px-3 py-1 rounded-full inline-flex items-center"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                              <circle cx="12" cy="12" r="10"></circle>
                                              <circle cx="12" cy="12" r="4"></circle>
                                              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                                              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                                              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                                              <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                                              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                                            </svg>
                                            {t('labels.actions.listenSpotify', 'Listen on Spotify')}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-400">
                              {t('labels.stats.noReleasesFound', 'No releases found for this label')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="bg-dark-card rounded-lg flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                      <Album className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                      <p>{t('labels.selectLabel', 'Select a label to view details')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default LabelsPage; 