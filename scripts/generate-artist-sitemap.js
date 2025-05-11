const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function generateArtistSitemap() {
  try {
    // Fetch all artists from Supabase
    const { data: artists, error } = await supabase
      .from('artists')
      .select('id, updated_at')
      .order('monthly_listeners', { ascending: false });

    if (error) throw error;

    // Generate XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${artists.map(artist => `  <url>
    <loc>https://urbangreece.com/artist/${artist.id}</loc>
    <lastmod>${new Date(artist.updated_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write to file
    fs.writeFileSync('public/sitemap-artists.xml', xmlContent);
    console.log(`Generated sitemap with ${artists.length} artist URLs`);

  } catch (error) {
    console.error('Error generating artist sitemap:', error);
  }
}

// Run the generator
generateArtistSitemap(); 