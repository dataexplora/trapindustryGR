// import-artist-data.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const artistDataService = require('./artistDataService');

/**
 * Process artist data from JSON file and store in Supabase
 * @param {string} filePath - Path to the JSON file containing artist data
 */
async function importArtistDataFromFile(filePath) {
  try {
    // Read the JSON file
    console.log(`Reading file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const artistsData = JSON.parse(rawData);
    
    console.log(`Found ${artistsData.length} artists in the file`);
    
    // Process each artist
    const results = {
      successful: [],
      failed: []
    };
    
    for (let i = 0; i < artistsData.length; i++) {
      const artistData = artistsData[i];
      console.log(`Processing artist ${i + 1}/${artistsData.length}: ${artistData.name} (${artistData.id})`);
      
      try {
        if (artistData.status === true && artistData.type === 'artist') {
          const result = await artistDataService.upsertArtistData(artistData);
          
          if (result.success) {
            results.successful.push({
              id: artistData.id,
              name: artistData.name
            });
            console.log(`✅ Successfully processed: ${artistData.name}`);
          } else {
            results.failed.push({
              id: artistData.id,
              name: artistData.name,
              error: result.error
            });
            console.error(`❌ Failed to process: ${artistData.name} - ${result.error}`);
          }
        } else {
          console.warn(`⚠️ Skipping invalid artist data at index ${i}`);
        }
      } catch (error) {
        results.failed.push({
          id: artistData.id || 'unknown',
          name: artistData.name || 'unknown',
          error: error.message
        });
        console.error(`❌ Error processing artist: ${error.message}`);
      }
      
      // Add a small delay to avoid overwhelming the database
      if (i < artistsData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Output summary
    console.log('\n========== IMPORT SUMMARY ==========');
    console.log(`Total artists: ${artistsData.length}`);
    console.log(`Successfully processed: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed artists:');
      results.failed.forEach(item => {
        console.log(`- ${item.name} (${item.id}): ${item.error}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error importing artist data:', error);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  // Check if file path is provided as command line argument
  const filePath = process.argv[2] || 'artist_serverapi_response.json';
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    console.log('Usage: node import-artist-data.js [path/to/json/file]');
    process.exit(1);
  }
  
  try {
    console.log('Starting artist data import...');
    const results = await importArtistDataFromFile(filePath);
    console.log('Import completed!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the script
main(); 