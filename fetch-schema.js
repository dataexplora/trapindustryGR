// Use this script to export Supabase database schema and sample data
// Run with: node fetch-schema.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// List of important tables to focus on
const keyTables = [
  'artists',
  'tracks',
  'albums',
  'artist_albums',
  'artist_tracks',
  'playlists',
  'playlist_images',
  'related_artists',
  'artist_external_links',
  'artist_playlists',
  'artist_top_cities'
];

async function fetchSchema() {
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }
    
    const allTableNames = tables.map(t => t.tablename);
    console.log('=== ALL TABLES ===');
    console.log(allTableNames);
    
    const schemaInfo = {
      tables: [],
      relations: []
    };
    
    // Only process important tables for detailed analysis
    const tablesToProcess = allTableNames.filter(tableName => keyTables.includes(tableName));
    console.log('\n=== PROCESSING KEY TABLES ===');
    console.log(tablesToProcess);
    
    // Get columns and sample data for each key table
    for (const tableName of tablesToProcess) {
      console.log(`\n=== TABLE: ${tableName} ===`);
      
      // Get columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        continue;
      }
      
      // Get row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error(`Error counting rows for ${tableName}:`, countError);
        continue;
      }
      
      // Get sample data (only 3 rows to keep it brief)
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (sampleError) {
        console.error(`Error fetching sample data for ${tableName}:`, sampleError);
        continue;
      }
      
      const tableInfo = {
        name: tableName,
        rowCount: count || 0,
        columns: columns,
        sampleData: sampleData
      };
      
      schemaInfo.tables.push(tableInfo);
      console.log(`${tableName}: ${count || 0} rows, ${columns?.length || 0} columns`);
    }
    
    // Get foreign key relationships 
    console.log('\n=== FOREIGN KEY RELATIONSHIPS ===');
    const { data: fallbackRelations, error: fallbackError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        table_name,
        constraint_type
      `)
      .eq('constraint_type', 'FOREIGN KEY')
      .eq('table_schema', 'public');
      
    if (fallbackError) {
      console.error('Error fetching relations:', fallbackError);
    } else {
      schemaInfo.relations = fallbackRelations;
      console.log(`Found ${fallbackRelations?.length || 0} relations`);
    }
    
    // Write to a file
    const outputFile = 'schema-info.json';
    fs.writeFileSync(outputFile, JSON.stringify(schemaInfo, null, 2));
    console.log(`\nSchema information saved to ${outputFile}`);
    
    return schemaInfo;
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

fetchSchema(); 