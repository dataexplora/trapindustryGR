import { supabase } from '@/lib/supabase';

/**
 * Utility to explore Supabase tables and relations
 */
export async function exploreDatabase() {
  try {
    // Get list of all tables
    console.log('Fetching Supabase tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }
    
    console.log('Available tables:', tables?.map(t => t.tablename) || []);
    
    // For each table, get columns and sample data
    for (const table of (tables || [])) {
      const tableName = table.tablename;
      console.log(`\n==== TABLE: ${tableName} ====`);
      
      // Get columns
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_column_info', { table_name: tableName });
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        continue;
      }
      
      console.log('Columns:', columns);
      
      // Get sample data (first 3 rows)
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (sampleError) {
        console.error(`Error fetching sample data for ${tableName}:`, sampleError);
        continue;
      }
      
      console.log('Sample data:', sampleData);
    }
    
    // Get foreign key relationships
    console.log('\n==== FOREIGN KEY RELATIONSHIPS ====');
    const { data: relations, error: relationsError } = await supabase
      .rpc('get_foreign_keys');
    
    if (relationsError) {
      console.error('Error fetching foreign key relationships:', relationsError);
      return;
    }
    
    console.log('Foreign keys:', relations);
    
    return {
      tables: tables?.map(t => t.tablename) || [],
      relations: relations || []
    };
  } catch (error) {
    console.error('Error exploring database:', error);
  }
}

/**
 * Define stored procedures for database exploration
 * These need to be executed once in your Supabase SQL editor:
 
CREATE OR REPLACE FUNCTION get_column_info(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    columns.column_name::text,
    columns.data_type::text,
    columns.is_nullable::text,
    columns.column_default::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1
  ORDER BY ordinal_position;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_foreign_keys()
RETURNS TABLE (
  table_name text,
  column_name text,
  foreign_table_name text,
  foreign_column_name text,
  constraint_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.table_name::text,
    kcu.column_name::text,
    ccu.table_name::text AS foreign_table_name,
    ccu.column_name::text AS foreign_column_name,
    tc.constraint_name::text
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;
 */ 