import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TrackRow from '../components/TrackRow';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { ListMusic, TrendingUp, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

interface Song {
  id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  album_name: string;
  cover_art: string;
  duration: string;
  release_date: string;
  spotify_url: string;
  youtube_url?: string;
  genres: string[];
  streams: number;
  created_at: string;
  updated_at: string;
}

const SongsPage = () => {
  const { allTracks: tracks, isLoading, isLoadingAll, error, refreshData, loadAllData } = useData();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [uniqueGenres, setUniqueGenres] = useState<string[]>([]);
  const [uniqueArtists, setUniqueArtists] = useState<Set<string>>(new Set());

  // Load all track data when component mounts
  useEffect(() => {
    // Load all tracks from DataContext when the component mounts
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('songs')
          .select('*', { count: 'exact', head: true });
        
        setTotalSongs(count || 0);

        // Fetch songs
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('streams', { ascending: false });

        if (error) throw error;
        
        setSongs(data || []);

        // Extract unique genres and artists
        const genres = new Set<string>();
        const artists = new Set<string>();
        data?.forEach(song => {
          song.genres.forEach(genre => genres.add(genre));
          artists.add(song.artist_name);
        });
        setUniqueGenres(Array.from(genres));
        setUniqueArtists(artists);

      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  // Prepare structured data for music search
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    '@id': 'https://urbangreece.com/songs',
    name: 'Top Greek Urban Songs - Urban Greece',
    description: `Explore ${totalSongs} Greek songs from ${uniqueArtists.size} artists across ${uniqueGenres.length} genres. Latest releases and top tracks in Greek urban music.`,
    numTracks: totalSongs,
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
            '@id': 'https://urbangreece.com/songs',
            name: 'Songs'
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
    // Add top songs
    track: songs.slice(0, 10).map(song => ({
      '@type': 'MusicRecording',
      '@id': `https://urbangreece.com/songs/${song.id}`,
      name: song.title,
      byArtist: {
        '@type': 'MusicGroup',
        '@id': `https://urbangreece.com/artist/${song.artist_id}`,
        name: song.artist_name
      },
      inAlbum: {
        '@type': 'MusicAlbum',
        name: song.album_name
      },
      duration: song.duration,
      datePublished: song.release_date,
      image: song.cover_art,
      url: song.spotify_url,
      genre: song.genres,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ListenAction',
        userInteractionCount: song.streams,
        name: 'Streams'
      }
    }))
  };

  // Enhanced keywords for songs
  const enhancedKeywords = [
    'greek songs',
    'greek music',
    'greek urban songs',
    'greek trap songs',
    'greek hip hop songs',
    'new greek songs',
    'top greek songs',
    'greek music streaming',
    'greek music charts',
    'greek song rankings',
    ...uniqueGenres.map(genre => `greek ${genre} songs`),
    ...uniqueGenres.map(genre => `${genre} music greece`),
    ...Array.from(uniqueArtists).slice(0, 10),
    ...songs.slice(0, 10).map(song => song.title),
    ...songs.slice(0, 10).map(song => `${song.title} ${song.artist_name}`),
    'urban greece songs',
    'greek music platform',
    'greek song statistics',
    'most streamed greek songs',
    'popular greek songs'
  ];

  // Function to handle playing a track
  const handlePlayTrack = (trackId: string) => {
    setSelectedTrack(trackId);
  };

  // Show combined loading state if either songs or tracks are loading
  const showLoading = isLoading || isLoadingAll;

  return (
    <>
      <SEO
        title={`Top Greek Songs - ${totalSongs} Urban Tracks | Urban Greece`}
        description={`Stream ${totalSongs} Greek songs from ${uniqueArtists.size} artists. Latest releases, top tracks, and trending songs in Greek urban music. Updated daily with new music and statistics.`}
        type="music.playlist"
        keywords={enhancedKeywords}
        section="Songs"
        category="Music Playlist"
        tags={uniqueGenres}
        structuredData={structuredData}
        publishedAt={songs[0]?.created_at}
        updatedAt={new Date().toISOString()}
      />

      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <TrendingUp className="mr-2 h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Top Greek Urban Songs & Tracks | Most Streamed</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            {showLoading ? (
              <div className="flex justify-center items-center h-[32rem]">
                <div className="flex items-center space-x-2 text-xl text-gray-300">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading tracks...</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-center text-red-200">
                <p>{error}</p>
                <button 
                  onClick={() => refreshData()}
                  className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-md text-red-200 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : tracks.length === 0 ? (
              <div className="bg-dark-card rounded-lg p-8 text-center">
                <ListMusic className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-300 text-lg">No tracks found</p>
                <p className="text-gray-500 text-sm mt-2">Please try again later</p>
              </div>
            ) : (
              <>
                <div className="text-right mb-3 text-sm text-gray-400">
                  Showing top {tracks.length} most streamed tracks
                </div>
                <div className="space-y-3">
                  {tracks.map((track, index) => (
                    <div key={track.id}>
                      <TrackRow 
                        track={track} 
                        rank={index + 1} 
                        onPlay={handlePlayTrack}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spotify Player Modal */}
        <SpotifyPlayer
          trackId={selectedTrack || ''}
          isOpen={!!selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      </Layout>
    </>
  );
};

export default SongsPage;
