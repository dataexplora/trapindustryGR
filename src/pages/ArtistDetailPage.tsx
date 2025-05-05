import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArtistWithImages, artistService } from '../services/artistService';
import Layout from '../components/Layout';
import { 
  Star, Music, User, Users, ExternalLink, Calendar, Heart, 
  Instagram, Twitter, Youtube, Facebook, Globe, Link2
} from 'lucide-react';
import { formatNumber } from '../utils/format';

// Helper to get the appropriate icon for a social link
const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <Instagram className="w-4 h-4" />;
  if (lowerName.includes('twitter') || lowerName.includes('x.com')) return <Twitter className="w-4 h-4" />;
  if (lowerName.includes('youtube')) return <Youtube className="w-4 h-4" />;
  if (lowerName.includes('facebook')) return <Facebook className="w-4 h-4" />;
  if (lowerName.includes('website') || lowerName.includes('homepage')) return <Globe className="w-4 h-4" />;
  return <Link2 className="w-4 h-4" />;
};

const ArtistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const artistData = await artistService.getArtistById(id);
          
          if (artistData) {
            setArtist(artistData);
          }
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-subtle text-xl text-gray-300">Loading artist details...</div>
        </div>
      </Layout>
    );
  }

  if (!artist) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl text-white">Artist not found</h2>
          <Link to="/artists" className="text-indigo-400 hover:underline mt-4 inline-block">
            Return to Artists
          </Link>
        </div>
      </Layout>
    );
  }

  // Default image if none is available
  const avatarImage = artist.images?.avatar || 'https://via.placeholder.com/400x400?text=No+Avatar';
  const headerImage = artist.images?.header || 'https://via.placeholder.com/1200x300?text=No+Header+Image';

  return (
    <Layout>
      <div className="relative">
        <div 
          className="h-64 bg-gradient-to-r from-indigo-900 to-purple-900 bg-center bg-cover"
          style={{ backgroundImage: `url(${headerImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="relative -mt-24">
            <div className="bg-dark-card rounded-xl shadow-xl p-6 border border-dark-border">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <img 
                  src={avatarImage} 
                  alt={artist.name} 
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-dark-background shadow-md" 
                />
                <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start">
                    <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                    {artist.verified && (
                      <div className="ml-3 bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {artist.externalLinks && artist.externalLinks.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start mt-3 space-x-3">
                      {artist.externalLinks.map(link => (
                        <a 
                          key={link.id} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors p-2 bg-dark-muted rounded-full border border-dark-border hover:border-indigo-500"
                          title={link.name}
                        >
                          {getSocialIcon(link.name)}
                        </a>
                      ))}
                    </div>
                  )}

                  {artist.biography && (
                    <div className="mt-4 text-gray-300 max-w-2xl">
                      <p>{artist.biography.length > 200 ? `${artist.biography.substring(0, 200)}...` : artist.biography}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-1 text-indigo-400" />
                        Followers
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formatNumber(artist.followers || 0)}
                      </div>
                    </div>
                    <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                      <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                        <Heart className="w-4 h-4 mr-1 text-pink-400" />
                        Monthly Listeners
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formatNumber(artist.monthly_listeners || 0)}
                      </div>
                    </div>
                    {artist.world_rank && (
                      <div className="bg-dark-muted p-4 rounded-lg border border-dark-border">
                        <div className="flex items-center justify-center md:justify-start text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          World Rank
                        </div>
                        <div className="text-xl font-bold text-white">
                          #{formatNumber(artist.world_rank)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Spotify Link */}
                  {artist.share_url && (
                    <div className="mt-6">
                      <a 
                        href={artist.share_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Spotify
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Music className="mr-2 h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>
        
        {artist.images?.gallery && artist.images.gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.images.gallery.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-dark-border">
                <img 
                  src={image} 
                  alt={`${artist.name} - Gallery ${index + 1}`} 
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No gallery images available for this artist.</p>
        )}
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Calendar className="mr-2 h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Last Updated</h2>
        </div>
        
        <div className="bg-dark-card p-4 rounded-lg border border-dark-border max-w-lg mx-auto">
          <p className="text-center text-gray-300">
            {artist.last_updated ? new Date(artist.last_updated).toLocaleDateString() : 'No update information available'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistDetailPage;
