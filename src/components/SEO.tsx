import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  author?: string;
  keywords?: string[];
  canonicalUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  locale?: string;
  alternateLocales?: string[];
  category?: string;
  tags?: string[];
  section?: string;
  musicGenres?: string[];
  // Music-specific properties
  duration?: string;
  albumName?: string;
  releaseDate?: string;
  recordLabel?: string;
  // Artist-specific properties
  followers?: number;
  monthlyListeners?: number;
  topTracks?: Array<{name: string; url: string}>;
  socialLinks?: {
    spotify?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  // Structured data
  structuredData?: object;
}

export const SEO = ({
  title = 'Urban Greece',
  description = 'Exploring the Urban Culture of the Greek Scene',
  image = '/assets/images/logo.webp',
  type = 'website',
  author = 'Urban Greece',
  keywords = ['greek music', 'urban music', 'greek artists', 'greek songs'],
  canonicalUrl,
  publishedAt,
  updatedAt,
  locale = 'el-GR',
  alternateLocales = ['en-US'],
  category,
  tags = [],
  section,
  musicGenres = [],
  duration,
  albumName,
  releaseDate,
  recordLabel,
  followers,
  monthlyListeners,
  topTracks = [],
  socialLinks = {},
  structuredData,
}: SEOProps) => {
  const location = useLocation();
  const siteUrl = 'https://urbangreece.com'; // Replace with your actual domain
  const currentUrl = `${siteUrl}${location.pathname}`;
  
  useEffect(() => {
    // Basic meta tags
    document.title = title;
    updateMetaTag('description', description);
    updateMetaTag('author', author);
    updateMetaTag('keywords', [...keywords, ...tags, ...musicGenres].join(', '));
    
    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image.startsWith('http') ? image : `${siteUrl}${image}`);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Urban Greece');
    updateMetaTag('og:locale', locale);
    alternateLocales.forEach(altLocale => {
      updateMetaTag('og:locale:alternate', altLocale);
    });
    if (publishedAt) updateMetaTag('article:published_time', publishedAt);
    if (updatedAt) updateMetaTag('article:modified_time', updatedAt);
    if (section) updateMetaTag('article:section', section);
    tags.forEach(tag => {
      updateMetaTag('article:tag', tag);
    });
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `${siteUrl}${image}`);
    updateMetaTag('twitter:site', '@urbangreece');
    
    // Music-specific meta tags
    if (musicGenres.length > 0) updateMetaTag('music:genre', musicGenres.join(', '));
    if (duration) updateMetaTag('music:duration', duration);
    if (albumName) updateMetaTag('music:album', albumName);
    if (releaseDate) updateMetaTag('music:release_date', releaseDate);
    
    // Additional meta tags for rich snippets
    if (category) updateMetaTag('category', category);
    if (recordLabel) updateMetaTag('music:creator', recordLabel);
    if (followers) updateMetaTag('music:followers', followers.toString());
    if (monthlyListeners) updateMetaTag('music:monthly_listeners', monthlyListeners.toString());
    
    // Update canonical URL
    updateCanonicalUrl(canonicalUrl || currentUrl);
    
    // Add structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
    
    // Cleanup function
    return () => {
      // Remove all meta tags
      [
        'description', 'author', 'keywords', 'category',
        'og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name',
        'og:locale', 'article:published_time', 'article:modified_time', 'article:section',
        'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:site',
        'music:genre', 'music:duration', 'music:album', 'music:release_date', 'music:creator',
        'music:followers', 'music:monthly_listeners'
      ].forEach(removeMetaTag);
      
      // Remove alternate locale tags
      alternateLocales.forEach(locale => {
        removeMetaTag(`og:locale:alternate`);
      });
      
      // Remove article tags
      tags.forEach(() => {
        removeMetaTag('article:tag');
      });
      
      removeCanonicalUrl();
      removeStructuredData();
    };
  }, [
    title, description, image, type, author, keywords, canonicalUrl, publishedAt,
    updatedAt, locale, alternateLocales, category, tags, section, musicGenres,
    duration, albumName, releaseDate, recordLabel, followers, monthlyListeners,
    structuredData, currentUrl
  ]);
  
  return null;
};

// Helper functions
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

const removeMetaTag = (name: string) => {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (meta) {
    meta.remove();
  }
};

const updateCanonicalUrl = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.setAttribute('href', url);
};

const removeCanonicalUrl = () => {
  const link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.remove();
  }
};

const updateStructuredData = (data: object) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

const removeStructuredData = () => {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script) {
    script.remove();
  }
};

export default SEO; 