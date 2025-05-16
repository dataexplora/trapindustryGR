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
  

  

  return (
    <>
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