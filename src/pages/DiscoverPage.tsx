import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import Layout from '../components/Layout';
import { Sparkles } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  image_url: string;
  monthly_listeners: number;
  followers: number;
  genres: string[];
  rank: number;
  created_at: string;
  updated_at: string;
}

export const DiscoverPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArtists, setTotalArtists] = useState(0);
  const [uniqueGenres, setUniqueGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('artists')
          .select('*', { count: 'exact', head: true });
        
        setTotalArtists(count || 0);

        // Fetch artists
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .order('monthly_listeners', { ascending: false });

        if (error) throw error;
        
        setArtists(data || []);

        // Extract unique genres
        const genres = new Set<string>();
        data?.forEach(artist => {
          artist.genres.forEach(genre => genres.add(genre));
        });
        setUniqueGenres(Array.from(genres));

      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Prepare structured data for music search
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://urbangreece.com/discover',
    name: 'Discover Greek Artists - Urban Greece',
    description: `Explore ${totalArtists} Greek artists across ${uniqueGenres.length} genres. From emerging talents to established stars in Greek urban music.`,
    about: {
      '@type': 'Thing',
      name: 'Greek Urban Music',
      description: 'Contemporary Greek urban music scene including trap, hip-hop, and modern Greek music.'
    },
    numberOfItems: totalArtists,
    genre: uniqueGenres,
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
            name: 'Discover'
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
      itemListElement: artists.slice(0, 10).map((artist, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicGroup',
          '@id': `https://urbangreece.com/artist/${artist.id}`,
          name: artist.name,
          image: artist.image_url,
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
            }
          ],
          genre: artist.genres
        }
      }))
    }
  };

  // Enhanced keywords for discovery
  const enhancedKeywords = [
    'greek artists',
    'greek music',
    'greek urban music',
    'greek trap',
    'greek hip hop',
    'new greek artists',
    'emerging greek artists',
    'top greek artists',
    'greek music discovery',
    'greek music streaming',
    'greek music charts',
    'greek music rankings',
    ...uniqueGenres.map(genre => `greek ${genre}`),
    ...uniqueGenres.map(genre => `${genre} music greece`),
    ...artists.slice(0, 10).map(artist => artist.name),
    'urban greece',
    'greek music platform',
    'greek music statistics',
    'monthly listeners greece',
    'greek music followers'
  ];

  return (
    <>
      <SEO
        title={`Discover Greek Artists - Top ${totalArtists} Urban Artists | Urban Greece`}
        description={`Explore ${totalArtists} Greek artists across ${uniqueGenres.length} genres. Find emerging talents, rising stars, and established artists in Greek urban music. Updated rankings and statistics for all artists.`}
        type="website"
        keywords={enhancedKeywords}
        section="Discover"
        category="Music Directory"
        tags={uniqueGenres}
        structuredData={structuredData}
        publishedAt={artists[0]?.created_at}
        updatedAt={new Date().toISOString()}
      />

      <Layout>
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center mb-4">
              <Sparkles className="mr-3 h-7 w-7 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Discover Greek Artists</h1>
            </div>
            <p className="text-lg max-w-3xl text-gray-200 mb-6">
              Explore {totalArtists} artists across {uniqueGenres.length} genres in the Greek urban music scene.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse-subtle text-xl text-gray-300">Loading artists...</div>
            </div>
          ) : (
            <div>
              {/* Your existing discover page content */}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}; 