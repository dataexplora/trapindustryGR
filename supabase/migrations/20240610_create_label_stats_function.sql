-- Function to get label statistics including albums, tracks, artists, and market share
CREATE OR REPLACE FUNCTION public.get_label_stats()
RETURNS TABLE (
  name TEXT,
  album_count BIGINT,
  track_count BIGINT,
  artist_count BIGINT,
  release_years TEXT[],
  latest_release DATE,
  earliest_release DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH albums_with_labels AS (
    SELECT 
      id AS album_id,
      COALESCE(label, '') AS label,
      track_count,
      release_date,
      EXTRACT(YEAR FROM release_date)::TEXT AS release_year
    FROM 
      albums
  ),
  artist_albums_rel AS (
    SELECT 
      aa.album_id,
      aa.artist_id,
      a.name AS artist_name,
      al.label,
      al.track_count,
      al.release_date,
      al.release_year
    FROM 
      artist_albums aa
    JOIN
      artists a ON aa.artist_id = a.id
    JOIN
      albums_with_labels al ON aa.album_id = al.album_id
  ),
  -- Identify labels that are likely artist names or independent releases
  label_classification AS (
    SELECT
      albumrel.label,
      albumrel.album_id,
      albumrel.artist_id,
      albumrel.track_count,
      albumrel.release_date,
      albumrel.release_year,
      CASE WHEN 
        albumrel.label = '' OR -- empty label
        EXISTS (
          SELECT 1 FROM artists a 
          WHERE LOWER(a.name) = LOWER(albumrel.label)
        ) OR -- label matches any artist name
        LOWER(albumrel.label) = LOWER(albumrel.artist_name) OR -- label matches this artist's name
        albumrel.label LIKE '%Official%' OR
        albumrel.label LIKE '%official%' OR
        albumrel.label ~ '^[A-Za-z0-9]+ Music$' OR
        albumrel.label ~ '^DJ [A-Za-z0-9]+$' OR
        albumrel.label ~ '^MC [A-Za-z0-9]+$' OR
        LOWER(albumrel.label) = 'self-released' OR
        LOWER(albumrel.label) = 'independent' OR
        LOWER(albumrel.label) = 'ανεξάρτητη κυκλοφορία'
      THEN 'Independent'
      ELSE albumrel.label
      END AS adjusted_label
    FROM 
      artist_albums_rel albumrel
  ),
  -- Calculate stats for all labels (standard + independent)
  label_stats AS (
    SELECT 
      lc.adjusted_label AS name,
      COUNT(DISTINCT lc.album_id) AS album_count,
      COALESCE(SUM(lc.track_count), 0) AS track_count,
      COUNT(DISTINCT lc.artist_id) AS artist_count,
      ARRAY_AGG(DISTINCT lc.release_year) FILTER (WHERE lc.release_year IS NOT NULL) AS release_years,
      MAX(lc.release_date) AS latest_release,
      MIN(lc.release_date) AS earliest_release
    FROM 
      label_classification lc
    GROUP BY 
      lc.adjusted_label
  )
  
  SELECT * FROM label_stats
  ORDER BY album_count DESC;
END;
$$; 