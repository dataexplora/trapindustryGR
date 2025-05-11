import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateTracksSitemap() {
  try {
    // Fetch all tracks from Supabase
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id, updated_at')
      .order('play_count', { ascending: false });

    if (error) throw error;

    // Generate XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tracks.map(track => `  <url>
    <loc>https://urbangreece.com/track/${track.id}</loc>
    <lastmod>${new Date(track.updated_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write to file
    fs.writeFileSync('public/sitemap-tracks.xml', xmlContent);
    console.log(`Generated sitemap with ${tracks.length} track URLs`);

  } catch (error) {
    console.error('Error generating tracks sitemap:', error);
    process.exit(1); // Exit with error code if something goes wrong
  }
}

// Run the generator
generateTracksSitemap(); 