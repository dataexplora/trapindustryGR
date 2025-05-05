-- Analyze the relationships between tables
WITH table_info AS (
  SELECT
    t.tablename AS table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.tablename) AS column_count,
    pg_total_relation_size('public.' || t.tablename) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) AS pretty_size,
    (SELECT reltuples::bigint FROM pg_class WHERE oid = ('public.' || t.tablename)::regclass) AS approx_row_count
  FROM
    pg_tables t
  WHERE
    t.schemaname = 'public'
),
foreign_keys AS (
  SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
  FROM 
    information_schema.table_constraints tc
  JOIN 
    information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
  JOIN 
    information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
)
SELECT
  i.table_name,
  i.column_count,
  i.approx_row_count,
  i.pretty_size,
  coalesce(json_agg(
    json_build_object(
      'column', fk.column_name,
      'references_table', fk.foreign_table_name,
      'references_column', fk.foreign_column_name
    )
  ) FILTER (WHERE fk.table_name IS NOT NULL), '[]'::json) as foreign_keys,
  (SELECT json_agg(column_name) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = i.table_name) AS columns
FROM
  table_info i
LEFT JOIN
  foreign_keys fk ON i.table_name = fk.table_name
GROUP BY
  i.table_name, i.column_count, i.approx_row_count, i.pretty_size
ORDER BY
  i.table_size DESC; 