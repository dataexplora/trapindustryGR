import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

interface HotArtist {
  id: string;
  name: string;
  image_url: string;
  monthly_listeners: number;
  followers: number;
  genres: string[];
  rank: number;
  growth_rate: number;
  previous_rank: number;
  created_at: string;
  updated_at: string;
}

export const HotArtistsPage = () => {
  const [artists, setArtists] = useState<HotArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArtists, setTotalArtists] = useState(0);
  const [uniqueGenres, setUniqueGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchHotArtists = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('artists')
          .select('*', { count: 'exact', head: true });
        
        setTotalArtists(count || 0);

        // Fetch hot artists (those with significant growth)
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .order('growth_rate', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        setArtists(data || []);

        // Extract unique genres
        const genres = new Set<string>();
        data?.forEach(artist => {
          artist.genres.forEach(genre => genres.add(genre));
        });
        setUniqueGenres(Array.from(genres));

      } catch (error) {
        console.error('Error fetching hot artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotArtists();
  }, []);

  // Calculate trending statistics
  const trendingStats = {
    totalGrowth: artists.reduce((sum, artist) => sum + artist.growth_rate, 0),
    averageGrowth: artists.length > 0 
      ? artists.reduce((sum, artist) => sum + artist.growth_rate, 0) / artists.length 
      : 0,
    topGainer: artists[0]?.name || '',
    topGainerGrowth: artists[0]?.growth_rate || 0
  };

  // Prepare structured data for trending artists
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://urbangreece.com/hot-artists',
    name: 'Trending Greek Artists - Urban Greece',
    description: `Discover the fastest-growing Greek artists. ${trendingStats.topGainer} leads with ${trendingStats.topGainerGrowth}% growth in monthly listeners.`,
    about: {
      '@type': 'Thing',
      name: 'Greek Music Trends',
      description: 'Real-time trends and statistics in Greek urban music scene.'
    },
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
            '@id': 'https://urbangreece.com/hot-artists',
            name: 'Hot Artists'
          }
        }
      ]
    },
    // Add trending artists
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: artists.length,
      itemListElement: artists.map((artist, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicGroup',
          '@id': `https://urbangreece.com/artist/${artist.id}`,
          name: artist.name,
          image: artist.image_url,
          genre: artist.genres,
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/ListenAction',
              userInteractionCount: artist.monthly_listeners,
              name: 'Monthly Listeners'
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/FollowAction',
              userInteractionCount: artist.followers,
              name: 'Followers'
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/GrowthRate',
              value: artist.growth_rate,
              name: 'Growth Rate'
            }
          ]
        }
      }))
    }
  };

  // Enhanced keywords for trending artists
  const enhancedKeywords = [
    'trending greek artists',
    'hot greek artists',
    'rising greek stars',
    'greek music trends',
    'upcoming greek artists',
    'viral greek artists',
    'greek music charts',
    'greek artist rankings',
    'fastest growing greek artists',
    'greek music statistics',
    'monthly listeners growth',
    'greek music analytics',
    ...uniqueGenres.map(genre => `trending greek ${genre} artists`),
    ...uniqueGenres.map(genre => `hot ${genre} artists greece`),
    ...artists.slice(0, 10).map(artist => artist.name),
    ...artists.slice(0, 10).map(artist => `${artist.name} growth`),
    'urban greece trends',
    'greek music growth',
    'greek artist statistics',
    'greek music platform'
  ];

  return (
    <>
      <SEO
        title={`Trending Greek Artists - Top ${artists.length} Rising Stars | Urban Greece`}
        description={`Discover the fastest-growing Greek artists. ${trendingStats.topGainer} leads with ${trendingStats.topGainerGrowth}% growth. Real-time rankings and growth statistics for emerging Greek talent.`}
        type="website"
        keywords={enhancedKeywords}
        section="Hot Artists"
        category="Music Trends"
        tags={uniqueGenres}
        structuredData={structuredData}
        publishedAt={artists[0]?.created_at}
        updatedAt={new Date().toISOString()}
      />

      {/* Rest of your hot artists page component */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {/* Your existing hot artists page content */}
          </div>
        )}
      </div>
    </>
  );
}; 