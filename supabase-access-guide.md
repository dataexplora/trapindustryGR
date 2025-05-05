# Sharing Supabase Database Access

To share your Supabase database structure safely, here are several options:

## Option 1: Run the SQL queries in Supabase and share the results

1. Go to the [Supabase dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Run the queries from `db-schema-query.sql`
5. Copy the results and share them

## Option 2: Use the Node.js script

1. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Install dependencies: `npm install dotenv @supabase/supabase-js`
3. Run the script: `node fetch-schema.js`
4. Share the generated `schema-info.json` file

## Option 3: Create a temporary database view

1. Go to the SQL Editor in Supabase
2. Run these commands to create a special view just for exploration:

```sql
-- Create a view that shows the database structure
CREATE OR REPLACE VIEW schema_explorer AS
SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  (
    SELECT COUNT(*)
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = t.table_name AND kcu.column_name = c.column_name AND tc.constraint_type = 'PRIMARY KEY'
  ) > 0 AS is_primary_key,
  (
    SELECT json_build_object(
      'constraint_name', tc.constraint_name,
      'foreign_table', ccu.table_name,
      'foreign_column', ccu.column_name
    )
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = t.table_name AND kcu.column_name = c.column_name AND tc.constraint_type = 'FOREIGN KEY'
    LIMIT 1
  ) AS foreign_key_info
FROM
  information_schema.tables t
JOIN
  information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE
  t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY
  t.table_name,
  c.ordinal_position;

-- Now you can query this view to see the database structure
SELECT * FROM schema_explorer;
```

3. Share the results

## Option 4: Share screenshots of Supabase Table Editor

1. Go to the Table Editor in the Supabase dashboard
2. Take screenshots of each table's structure 
3. Share the screenshots

## Important Security Notes

- Always use the anon key (public API key), never share your service_role key
- Consider creating a read-only API key for this purpose if you're concerned about security
- You can revoke the key after sharing the information
- Do not share actual user data in production databases 