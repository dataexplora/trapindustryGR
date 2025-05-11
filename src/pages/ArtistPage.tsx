import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  genres: string[];
  monthly_listeners: number;
  followers: number;
  spotify_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  top_tracks?: Array<{
    name: string;
    url: string;
    duration: string;
    album: string;
    release_date: string;
  }>;
  record_label?: string;
  created_at: string;
  updated_at: string;
}

export const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_BIO_LENGTH = 300; // Show first 300 characters initially

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, top_tracks(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArtist();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!artist) return <div>Artist not found</div>;

  // Prepare structured data for the artist
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `https://urbangreece.com/artist/${artist.id}`,
    name: artist.name,
    description: artist.bio,
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
      }
    ],
    sameAs: [
      artist.spotify_url,
      artist.instagram_url,
      artist.youtube_url,
      artist.twitter_url
    ].filter(Boolean),
    ...(artist.record_label && {
      recordLabel: {
        '@type': 'Organization',
        name: artist.record_label
      }
    }),
    ...(artist.top_tracks && {
      track: artist.top_tracks.map(track => ({
        '@type': 'MusicRecording',
        name: track.name,
        url: track.url,
        duration: track.duration,
        inAlbum: {
          '@type': 'MusicAlbum',
          name: track.album
        },
        datePublished: track.release_date
      }))
    })
  };

  // Enhanced meta tags for better SEO
  const enhancedKeywords = [
    artist.name,
    `${artist.name} songs`,
    `${artist.name} music`,
    `${artist.name} tracks`,
    `${artist.name} greek artist`,
    `${artist.name} spotify`,
    'greek music',
    'greek artist',
    'greek trap',
    'greek hip hop',
    ...artist.genres.map(genre => `${artist.name} ${genre}`),
    ...artist.genres.map(genre => `greek ${genre}`),
    'urban greece',
    'greek urban music'
  ];

  const shouldShowButton = artist.bio.length > MAX_BIO_LENGTH;
  const displayedBio = isExpanded ? artist.bio : artist.bio.slice(0, MAX_BIO_LENGTH);

  return (
    <>
      <SEO
        title={`${artist.name} - Greek Artist Profile | Urban Greece`}
        description={`Discover ${artist.name}, a Greek artist with ${artist.monthly_listeners.toLocaleString()} monthly listeners. ${artist.bio.slice(0, 150)}...`}
        image={artist.image_url}
        type="profile"
        keywords={enhancedKeywords}
        author={artist.name}
        publishedAt={artist.created_at}
        updatedAt={artist.updated_at}
        category="Music"
        tags={artist.genres}
        section="Artists"
        musicGenres={artist.genres}
        followers={artist.followers}
        monthlyListeners={artist.monthly_listeners}
        topTracks={artist.top_tracks}
        socialLinks={{
          spotify: artist.spotify_url,
          instagram: artist.instagram_url,
          youtube: artist.youtube_url,
          twitter: artist.twitter_url
        }}
        structuredData={structuredData}
      />
      
      {/* Rest of your artist page component */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{artist.name}</h1>
        <img src={artist.image_url} alt={artist.name} className="w-full max-w-2xl rounded-lg shadow-lg mb-6" />
        
        {/* Bio section with show more/less */}
        <div className="mb-6">
          <p className="text-gray-300">
            {isExpanded ? artist.bio : artist.bio.slice(0, MAX_BIO_LENGTH)}
            {!isExpanded && shouldShowButton && '...'}
          </p>
          {shouldShowButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm font-medium"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Monthly Listeners</h2>
          <p className="text-xl">{artist.monthly_listeners.toLocaleString()}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {artist.genres.map((genre) => (
              <span key={genre} className="px-3 py-1 bg-purple-900 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};