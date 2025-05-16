import { supabase } from '@/lib/supabase';
import { cacheService } from '@/lib/cacheService';

export interface Label {
  name: string;
  album_count: number;
  track_count: number;
  artist_count: number;
  release_years: string[];
  latest_release?: string;
  earliest_release?: string;
}

export interface AlbumWithArtist {
  id: string;
  name: string;
  share_url?: string;
  album_type: string;
  label: string;
  track_count: number;
  release_date?: string;
  artist_id: string;
  artist_name: string;
  cover_url?: string;
}

export const labelService = {
  /**
   * Get all unique labels from the database with album and artist counts
   * @returns An array of label objects with counts
   */
  getAllLabels: async (): Promise<Label[]> => {
    const cacheKey = 'getAllLabels';
    
    // Try to get from cache first
    const cachedData = cacheService.get<Label[]>(cacheKey);
    if (cachedData) {
      console.log("Using cached getAllLabels data");
      return cachedData;
    }
    
    try {
      console.log("Fetching fresh label data");
      
      // First try to get all labels using the RPC function
      const { data: rpcLabels, error: rpcError } = await supabase
        .rpc('get_label_stats');
        
      if (rpcError) {
        console.error('Error fetching labels:', rpcError);
        // Fall back to manual method if RPC fails
        return labelService.getLabelStatsManual();
      }
      
      // If no results, fall back to manual method
      if (!rpcLabels || rpcLabels.length === 0) {
        console.log("No labels from RPC, falling back to manual");
        return labelService.getLabelStatsManual();
      }
      
      // Get artist names to filter out artists posing as labels
      const { data: artists } = await supabase
        .from('artists')
        .select('name')
        .order('name');
      
      const artistNames = new Set(artists?.map(artist => artist.name.toLowerCase()) || []);
      
      // Filter out labels that are likely artist names or solos
      const filteredLabels = rpcLabels.filter(label => {
        // Skip labels that match artist names
        if (artistNames.has(label.name.toLowerCase())) {
          return false;
        }
        
        // Skip labels that are likely artist names based on patterns
        if (label.artist_count === 1 && 
            (label.name.includes('Official') || 
             /^[A-Za-z0-9]+ Music$/.test(label.name) ||
             /^DJ [A-Za-z0-9]+$/.test(label.name) ||
             /^MC [A-Za-z0-9]+$/.test(label.name))) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Found ${filteredLabels.length} regular labels after filtering`);
      
      // Now calculate the independent label using our improved method
      // Get all albums and relationships
      const { data: allAlbums } = await supabase
        .from('albums')
        .select('id, name, label, track_count, release_date');
      
      const { data: artistAlbums } = await supabase
        .from('artist_albums')
        .select('artist_id, album_id');
      
      // Create lookup maps
      const albumToArtistMap = new Map();
      artistAlbums?.forEach(rel => {
        albumToArtistMap.set(rel.album_id, rel.artist_id);
      });
      
      // Track independent stats
      const independentArtistIds = new Set();
      const independentAlbumIds = new Set();
      let independentTrackCount = 0;
      const independentReleaseYears = new Set();
      let independentLatestRelease = null;
      let independentEarliestRelease = null;
      
      // Process all albums to find independent ones
      allAlbums?.forEach(album => {
        const artistId = albumToArtistMap.get(album.id);
        
        // Skip if no associated artist
        if (!artistId) return;
        
        // Check if this should be an independent release
        if (!album.label || album.label.trim() === '') {
          // Null or empty label - definitely independent
          addToIndependentStats(album, artistId);
          return;
        }
        
        const labelName = album.label.trim();
        
        // Skip if this is a regular label we're keeping
        const isRegularLabel = filteredLabels.some(
          label => label.name.toLowerCase() === labelName.toLowerCase()
        );
        
        if (isRegularLabel) {
          return; // Don't count as independent if it's from a regular label
        }
        
        // Otherwise check if it should be considered independent
        const artist = artists?.find(a => a.id === artistId);
        const artistName = artist?.name || '';
        
        const isArtistAsLabel = 
          artistNames.has(labelName.toLowerCase()) || 
          labelName.toLowerCase() === artistName.toLowerCase() ||
          labelName.includes('Official') || 
          /^[A-Za-z0-9]+ Music$/.test(labelName) ||
          /^DJ [A-Za-z0-9]+$/.test(labelName) ||
          /^MC [A-Za-z0-9]+$/.test(labelName) ||
          labelName.toLowerCase() === 'self-released' ||
          labelName.toLowerCase() === 'independent' ||
          labelName.toLowerCase() === 'ανεξάρτητη κυκλοφορία';
        
        if (isArtistAsLabel) {
          addToIndependentStats(album, artistId);
        }
      });
      
      // Helper function to add to independent stats
      function addToIndependentStats(album, artistId) {
        independentAlbumIds.add(album.id);
        independentArtistIds.add(artistId);
        independentTrackCount += album.track_count || 0;
        
        if (album.release_date) {
          const releaseYear = new Date(album.release_date).getFullYear().toString();
          independentReleaseYears.add(releaseYear);
          
          if (!independentLatestRelease || new Date(album.release_date) > new Date(independentLatestRelease)) {
            independentLatestRelease = album.release_date;
          }
          
          if (!independentEarliestRelease || new Date(album.release_date) < new Date(independentEarliestRelease)) {
            independentEarliestRelease = album.release_date;
          }
        }
      }
      
      console.log(`Found ${independentAlbumIds.size} independent albums and ${independentArtistIds.size} independent artists`);
      
      // Create the Independent label
      const independentLabel: Label = {
        name: 'Independent',
        album_count: independentAlbumIds.size,
        track_count: independentTrackCount,
        artist_count: independentArtistIds.size,
        release_years: Array.from(independentReleaseYears),
        latest_release: independentLatestRelease,
        earliest_release: independentEarliestRelease
      };
      
      // Combine regular labels with independent
      const finalLabels = [...filteredLabels, independentLabel];
      
      // Sort by album count
      finalLabels.sort((a, b) => b.album_count - a.album_count);
      
      // Cache the results
      cacheService.set(cacheKey, finalLabels, 24 * 60 * 60); // Cache for 24 hours
      
      return finalLabels;
    } catch (error) {
      console.error('Error in getAllLabels:', error);
      return labelService.getLabelStatsManual();
    }
  },
  
  /**
   * Helper function to determine if a release should be considered independent
   */
  isIndependentRelease: (album: any, artistId: string, artistNames: Set<string>, allArtists: any[]) => {
    // If label is null or empty, it's independent
    if (!album.label || album.label.trim() === '') {
      return true;
    }
    
    const label = album.label.trim().toLowerCase();
    
    // Get the artist name
    const artist = allArtists?.find(a => a.id === artistId);
    const artistName = artist?.name?.toLowerCase() || '';
    
    // Check artist name patterns
    return (
      // Label matches an artist name
      artistNames.has(label) ||
      // Label matches this specific artist's name
      label === artistName ||
      // Common patterns for self-releases
      label.includes('official') ||
      /^[a-z0-9]+ music$/.test(label) ||
      /^dj [a-z0-9]+$/.test(label) ||
      /^mc [a-z0-9]+$/.test(label) ||
      // Special cases
      label === 'self-released' ||
      label === 'independent' ||
      label === 'ανεξάρτητη κυκλοφορία'
    );
  },
  
  /**
   * Manual fallback query to get label stats if the RPC isn't available
   */
  getLabelStatsManual: async (): Promise<Label[]> => {
    try {
      // Get all albums with labels and those with null labels
      const { data: albums, error } = await supabase
        .from('albums')
        .select('id, name, label, track_count, release_date')
        .order('release_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching albums with labels:', error);
        return [];
      }
      
      // Get artist-album relationships to count unique artists per label
      const { data: artistAlbums, error: relError } = await supabase
        .from('artist_albums')
        .select('artist_id, album_id');
        
      if (relError) {
        console.error('Error fetching artist-album relationships:', relError);
        return [];
      }
      
      // Get all artists to filter out artist names used as labels
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name');
      
      const artistNames = new Set(artists?.map(artist => artist.name.toLowerCase()) || []);
      
      // Build a map of album IDs to artist IDs
      const albumArtistMap = new Map();
      artistAlbums?.forEach(rel => {
        albumArtistMap.set(rel.album_id, rel.artist_id);
      });
      
      // Create a map of artist IDs to names
      const artistIdToName = new Map();
      artists?.forEach(artist => {
        artistIdToName.set(artist.id, artist.name);
      });
      
      // Process the data to group by label
      const labelMap = new Map<string, Label>();
      const independentAlbums = [];
      
      albums?.forEach(album => {
        const artistId = albumArtistMap.get(album.id);
        const artistName = artistIdToName.get(artistId) || '';
        
        // Check if this album should be considered independent
        // (null label, artist name as label, or pattern matches)
        if (!album.label || album.label.trim() === '') {
          // Add to independent releases if label is null or empty
          independentAlbums.push({
            ...album,
            artistId
          });
          return;
        }
        
        const labelName = album.label.trim();
        
        // Check if this label is likely an artist name
        const isArtistAsLabel = 
          artistNames.has(labelName.toLowerCase()) || 
          labelName.toLowerCase() === artistName.toLowerCase() ||
          labelName.includes('Official') || 
          /^[A-Za-z0-9]+ Music$/.test(labelName) ||
          /^DJ [A-Za-z0-9]+$/.test(labelName) ||
          /^MC [A-Za-z0-9]+$/.test(labelName);
        
        if (isArtistAsLabel) {
          // Treat as independent release
          independentAlbums.push({
            ...album,
            artistId
          });
          return;
        }
        
        const existingLabel = labelMap.get(labelName);
        
        const releaseYear = album.release_date 
          ? new Date(album.release_date).getFullYear().toString()
          : null;
        
        if (existingLabel) {
          existingLabel.album_count += 1;
          existingLabel.track_count += album.track_count || 0;
          
          // Track unique artists
          const artistId = albumArtistMap.get(album.id);
          if (artistId) {
            existingLabel.artist_ids.add(artistId);
            existingLabel.artist_count = existingLabel.artist_ids.size;
          }
          
          // Track release years
          if (releaseYear && !existingLabel.release_years.includes(releaseYear)) {
            existingLabel.release_years.push(releaseYear);
          }
          
          // Track latest and earliest releases
          if (album.release_date) {
            if (!existingLabel.latest_release || new Date(album.release_date) > new Date(existingLabel.latest_release)) {
              existingLabel.latest_release = album.release_date;
            }
            
            if (!existingLabel.earliest_release || new Date(album.release_date) < new Date(existingLabel.earliest_release)) {
              existingLabel.earliest_release = album.release_date;
            }
          }
        } else {
          const artistIds = new Set();
          const artistId = albumArtistMap.get(album.id);
          if (artistId) {
            artistIds.add(artistId);
          }
          
          labelMap.set(labelName, {
            name: labelName,
            album_count: 1,
            track_count: album.track_count || 0,
            artist_count: artistIds.size,
            artist_ids: artistIds, // Temporary field
            release_years: releaseYear ? [releaseYear] : [],
            latest_release: album.release_date,
            earliest_release: album.release_date
          });
        }
      });
      
      // Process independent albums into a single "Independent" label
      if (independentAlbums.length > 0) {
        const artistIds = new Set();
        let totalTracks = 0;
        const releaseYears = new Set();
        let latestRelease = null;
        let earliestRelease = null;
        
        independentAlbums.forEach(album => {
          totalTracks += album.track_count || 0;
          
          if (album.artistId) {
            artistIds.add(album.artistId);
          }
          
          const releaseYear = album.release_date 
            ? new Date(album.release_date).getFullYear().toString()
            : null;
            
          if (releaseYear) {
            releaseYears.add(releaseYear);
          }
          
          if (album.release_date) {
            if (!latestRelease || new Date(album.release_date) > new Date(latestRelease)) {
              latestRelease = album.release_date;
            }
            
            if (!earliestRelease || new Date(album.release_date) < new Date(earliestRelease)) {
              earliestRelease = album.release_date;
            }
          }
        });
        
        labelMap.set('Independent', {
          name: 'Independent',
          album_count: independentAlbums.length,
          track_count: totalTracks,
          artist_count: artistIds.size,
          artist_ids: artistIds, // Temporary field
          release_years: Array.from(releaseYears),
          latest_release: latestRelease,
          earliest_release: earliestRelease
        });
      }
      
      // Convert to array and remove temporary fields
      const result = Array.from(labelMap.values()).map(label => {
        const { artist_ids, ...cleanLabel } = label as any;
        return cleanLabel;
      });
      
      // Sort by album count (descending)
      result.sort((a, b) => b.album_count - a.album_count);
      
      // Cache the results
      cacheService.set('getAllLabels', result, 3600); // Cache for 1 hour
      
      return result;
    } catch (error) {
      console.error('Error in getLabelStatsManual:', error);
      return [];
    }
  },
  
  /**
   * Get albums released by a specific label
   * @param labelName The exact name of the label
   * @returns Albums with artist information
   */
  getLabelAlbums: async (labelName: string): Promise<AlbumWithArtist[]> => {
    const cacheKey = `getLabelAlbums-${labelName}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<AlbumWithArtist[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // If label is "Independent", handle specially
      if (labelName === 'Independent') {
        return labelService.getIndependentLabelAlbums();
      }
      
      // Get albums by label name
      const { data: albums, error } = await supabase
        .from('albums')
        .select(`
          id, 
          name, 
          share_url, 
          album_type, 
          label, 
          track_count, 
          release_date
        `)
        .eq('label', labelName)
        .order('release_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching albums by label:', error);
        return [];
      }
      
      if (!albums || albums.length === 0) {
        return [];
      }
      
      // Get artist-album relationships
      const albumIds = albums.map(album => album.id);
      const { data: artistAlbums, error: relError } = await supabase
        .from('artist_albums')
        .select('artist_id, album_id')
        .in('album_id', albumIds);
        
      if (relError) {
        console.error('Error fetching artist-album relationships:', relError);
        return [];
      }
      
      // Get all artist IDs to fetch artist data
      const artistIds = new Set<string>();
      artistAlbums?.forEach(rel => artistIds.add(rel.artist_id));
      
      // Get artist data
      const { data: artists, error: artistError } = await supabase
        .from('artists')
        .select('id, name')
        .in('id', Array.from(artistIds));
        
      if (artistError) {
        console.error('Error fetching artists:', artistError);
        return [];
      }
      
      // Create a map of artist IDs to artist objects
      const artistMap = new Map();
      artists?.forEach(artist => artistMap.set(artist.id, artist));
      
      // Create a map of album IDs to artist IDs
      const albumArtistMap = new Map();
      artistAlbums?.forEach(rel => {
        albumArtistMap.set(rel.album_id, rel.artist_id);
      });
      
      // Get album cover images
      const { data: albumImages, error: imageError } = await supabase
        .from('album_images')
        .select('album_id, url')
        .in('album_id', albumIds);
        
      if (imageError) {
        console.error('Error fetching album images:', imageError);
        return [];
      }
      
      // Create a map of album IDs to cover image URLs (just get the first one for each album)
      const albumCoverMap = new Map();
      albumImages?.forEach(image => {
        if (!albumCoverMap.has(image.album_id)) {
          albumCoverMap.set(image.album_id, image.url);
        }
      });
      
      // Combine all the data
      const result = albums.map(album => {
        const artistId = albumArtistMap.get(album.id);
        const artist = artistMap.get(artistId);
        const coverUrl = albumCoverMap.get(album.id);
        
        return {
          id: album.id,
          name: album.name,
          share_url: album.share_url,
          album_type: album.album_type,
          label: album.label,
          track_count: album.track_count,
          release_date: album.release_date,
          artist_id: artistId || '',
          artist_name: artist ? artist.name : 'Unknown Artist',
          cover_url: coverUrl
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, result, 24 * 60 * 60); // Cache for 24 hours
      
      return result;
    } catch (error) {
      console.error(`Error in getLabelAlbums for ${labelName}:`, error);
      return [];
    }
  },
  
  /**
   * Get albums released independently (where label is likely an artist name)
   * @returns Albums with artist information
   */
  getIndependentLabelAlbums: async (): Promise<AlbumWithArtist[]> => {
    try {
      const cacheKey = 'getLabelAlbums-Independent';
      
      // Try to get from cache first
      const cachedData = cacheService.get<AlbumWithArtist[]>(cacheKey);
      if (cachedData) {
        console.log("Using cached independent albums data");
        return cachedData;
      }
      
      console.log("Fetching fresh independent albums data");
      
      // Get regular labels first to exclude them
      const regularLabels = await labelService.getAllLabels();
      const regularLabelNames = new Set(
        regularLabels
          .filter(label => label.name !== 'Independent')
          .map(label => label.name.toLowerCase())
      );
      
      console.log(`Found ${regularLabelNames.size} regular labels to exclude`);
      
      // First get all artists
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name');
      
      const artistNames = new Set(artists?.map(artist => artist.name.toLowerCase()) || []);
      
      // Create a map of artist IDs to names
      const artistMap = new Map();
      artists?.forEach(artist => {
        artistMap.set(artist.id, artist);
      });
      
      // Get all albums
      const { data: albums, error } = await supabase
        .from('albums')
        .select(`
          id, 
          name, 
          share_url, 
          album_type, 
          label, 
          track_count, 
          release_date
        `)
        .order('release_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching all albums:', error);
        return [];
      }
      
      // Get artist-album relationships
      const albumIds = albums?.map(album => album.id) || [];
      const { data: artistAlbums, error: relError } = await supabase
        .from('artist_albums')
        .select('artist_id, album_id')
        .in('album_id', albumIds);
        
      if (relError) {
        console.error('Error fetching artist-album relationships:', relError);
        return [];
      }
      
      // Create a map of album IDs to artist IDs
      const albumArtistMap = new Map();
      artistAlbums?.forEach(rel => {
        albumArtistMap.set(rel.album_id, rel.artist_id);
      });
      
      // Get album cover images
      const { data: albumImages, error: imageError } = await supabase
        .from('album_images')
        .select('album_id, url')
        .in('album_id', albumIds);
        
      if (imageError) {
        console.error('Error fetching album images:', imageError);
        return [];
      }
      
      // Create a map of album IDs to cover image URLs
      const albumCoverMap = new Map();
      albumImages?.forEach(image => {
        if (!albumCoverMap.has(image.album_id)) {
          albumCoverMap.set(image.album_id, image.url);
        }
      });
      
      // Filter for independent releases
      const independentAlbums = albums?.filter(album => {
        if (!album || !album.id) return false;
        
        const artistId = albumArtistMap.get(album.id);
        if (!artistId) return false;
        
        // If null or empty label, it's independent
        if (!album.label || album.label.trim() === '') {
          return true;
        }
        
        const labelName = album.label.trim();
        
        // Skip if this is a regular label
        if (regularLabelNames.has(labelName.toLowerCase())) {
          return false;
        }
        
        // Get artist name
        const artist = artistMap.get(artistId);
        const artistName = artist ? artist.name : '';
        
        // Check if this is an artist-as-label case
        return (
          artistNames.has(labelName.toLowerCase()) || 
          labelName.toLowerCase() === artistName.toLowerCase() ||
          labelName.includes('Official') || 
          /^[A-Za-z0-9]+ Music$/.test(labelName) ||
          /^DJ [A-Za-z0-9]+$/.test(labelName) ||
          /^MC [A-Za-z0-9]+$/.test(labelName) ||
          labelName.toLowerCase() === 'self-released' ||
          labelName.toLowerCase() === 'independent' ||
          labelName.toLowerCase() === 'ανεξάρτητη κυκλοφορία'
        );
      }) || [];
      
      console.log(`Found ${independentAlbums.length} independent albums for details view`);
      
      // Format the results
      const result = independentAlbums.map(album => {
        const artistId = albumArtistMap.get(album.id);
        const artist = artistMap.get(artistId);
        const coverUrl = albumCoverMap.get(album.id);
        
        return {
          id: album.id,
          name: album.name,
          share_url: album.share_url,
          album_type: album.album_type,
          label: album.label || 'Independent', // Set NULL labels as "Independent"
          track_count: album.track_count,
          release_date: album.release_date,
          artist_id: artistId || '',
          artist_name: artist ? artist.name : 'Unknown Artist',
          cover_url: coverUrl
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, result, 24 * 60 * 60); // Cache for 24 hours
      
      return result;
    } catch (error) {
      console.error('Error in getIndependentLabelAlbums:', error);
      return [];
    }
  },
  
  /**
   * Clear the cache for all label data
   */
  clearLabelCache: () => {
    console.log("Clearing label cache");
    cacheService.remove('getAllLabels');
    cacheService.remove('getLabelAlbums-Independent');
    // Also clear any other label-specific cache entries
    return true;
  }
}; 