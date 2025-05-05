// index.js
const express = require('express');
const supabase = require('./supabase-setup');
const spotifyFetcher = require('./spotify-fetch');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes

// Get all artists (basic info)
app.get('/api/artists', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, share_url, verified, followers, monthly_listeners')
      .order('monthly_listeners', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get artist by ID (with detailed info)
app.get('/api/artists/:id', async (req, res) => {
  const artistId = req.params.id;
  
  try {
    // Get basic artist info
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single();
    
    if (artistError) throw artistError;
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    
    // Get external links
    const { data: links, error: linksError } = await supabase
      .from('artist_external_links')
      .select('*')
      .eq('artist_id', artistId);
    
    if (linksError) throw linksError;
    
    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('artist_images')
      .select('*')
      .eq('artist_id', artistId);
    
    if (imagesError) throw imagesError;
    
    // Get top cities
    const { data: topCities, error: topCitiesError } = await supabase
      .from('artist_top_cities')
      .select('*')
      .eq('artist_id', artistId)
      .order('rank', { ascending: true });
    
    if (topCitiesError) throw topCitiesError;
    
    // Get top tracks
    const { data: topTracks, error: topTracksError } = await supabase
      .from('artist_tracks')
      .select(`
        track_id,
        tracks:track_id (*)
      `)
      .eq('artist_id', artistId)
      .eq('is_top_track', true);
    
    if (topTracksError) throw topTracksError;
    
    // Combine all data
    const artistData = {
      ...artist,
      external_links: links || [],
      images: images || [],
      top_cities: topCities || [],
      top_tracks: topTracks ? topTracks.map(item => item.tracks) : [],
    };
    
    res.json(artistData);
  } catch (error) {
    console.error(`Error fetching artist ${artistId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch and update artist data from Spotify
app.post('/api/artists/:id/update', async (req, res) => {
  const artistId = req.params.id;
  
  try {
    const result = await spotifyFetcher.fetchAndStoreArtist(artistId);
    res.json(result);
  } catch (error) {
    console.error(`Error updating artist ${artistId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 