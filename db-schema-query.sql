-- Get all tables in the public schema
SELECT 
  tablename 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public';

-- Get columns for each table
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public'
ORDER BY 
  table_name, 
  ordinal_position;

-- Get foreign key relationships
SELECT
  tc.table_name AS source_table,
  kcu.column_name AS source_column,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column,
  tc.constraint_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE 
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- Get sample data from artists table
SELECT * FROM artists LIMIT 5;

-- Get sample data from tracks table (instead of songs)
SELECT * FROM tracks LIMIT 5;

-- Get sample data from albums table
SELECT * FROM albums LIMIT 5;

-- Get sample data from artist_albums table
SELECT * FROM artist_albums LIMIT 5;

-- Get sample data from artist_tracks table
SELECT * FROM artist_tracks LIMIT 5;

-- Get sample data from playlists table
SELECT * FROM playlists LIMIT 5; 