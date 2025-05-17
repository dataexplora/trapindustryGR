// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to update cached top artists with their IDs and ranks
async function updateTopArtists(limit = 100) {
  console.log(`Updating top ${limit} artists...`)
  
  try {
    // Clear the existing top artists cache
    await supabase.from('cached_top_artists').delete().neq('id', 0)
    
    // Get top artists by monthly listeners
    const { data: artists, error } = await supabase
      .from('artists')
      .select('id, name, monthly_listeners')
      .not('monthly_listeners', 'is', null)
      .order('monthly_listeners', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw error
    }
    
    if (!artists || artists.length === 0) {
      console.log('No artists found')
      return
    }
    
    console.log(`Found ${artists.length} top artists, caching their IDs and ranks...`)
    
    // Process each artist
    const cacheEntries = []
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i]
      const rank = i + 1
      
      // Skip invalid artists
      if (!artist || !artist.id || !artist.name) {
        console.warn(`Skipping invalid artist at position ${i+1}: ${JSON.stringify(artist)}`)
        continue
      }
      
      // Create cache entry
      cacheEntries.push({
        artist_id: artist.id,
        rank
      })
      
      console.log(`Added rank #${rank}: ${artist.name} (${artist.id}) - ${artist.monthly_listeners} monthly listeners`)
    }
    
    // Insert all entries in a single batch
    if (cacheEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('cached_top_artists')
        .insert(cacheEntries)
        
      if (insertError) {
        console.error('Error inserting cache entries:', insertError)
      } else {
        console.log(`Successfully cached ${cacheEntries.length} artist entries`)
      }
    }
  } catch (error) {
    console.error('Error updating top artists:', error)
  }
}

// Function to update cached top tracks with their IDs and ranks
async function updateTopTracks(limit = 100) {
  console.log(`Updating top ${limit} tracks...`)
  
  try {
    // Clear the existing top tracks cache
    await supabase.from('cached_top_tracks').delete().neq('id', 0)
    
    // Get top tracks by play count
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id, name, play_count')
      .not('play_count', 'is', null)
      .order('play_count', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw error
    }
    
    if (!tracks || tracks.length === 0) {
      console.log('No tracks found')
      return
    }
    
    console.log(`Found ${tracks.length} top tracks, caching their IDs and ranks...`)
    
    // Process all tracks
    const cacheEntries = []
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      const rank = i + 1
      
      // Skip tracks without a valid ID
      if (!track || !track.id || !track.name) {
        console.warn(`Skipping invalid track at position ${rank}`)
        continue
      }
      
      // Create cache entry
      cacheEntries.push({
        track_id: track.id,
        rank
      })
      
      console.log(`Added rank #${rank}: ${track.name} (${track.id}) - ${track.play_count} plays`)
    }
    
    // Insert all entries in a single batch
    if (cacheEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('cached_top_tracks')
        .insert(cacheEntries)
        
      if (insertError) {
        console.error('Error inserting cache entries:', insertError)
      } else {
        console.log(`Successfully cached ${cacheEntries.length} track entries`)
      }
    }
  } catch (error) {
    console.error('Error updating top tracks:', error)
  }
}

// Main function to handle the request
Deno.serve(async (req) => {
  try {
    console.log('Starting cache update...')
    
    // Update top artists (top 50)
    await updateTopArtists(50)
    
    // Update top tracks (top 100)
    await updateTopTracks(100)
    
    console.log('Cache update completed successfully!')
    
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Cache updated successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in cache update process:', error)
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'An error occurred',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 