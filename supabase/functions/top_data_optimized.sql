-- Function to get top artists with their images in a single efficient query
CREATE OR REPLACE FUNCTION get_top_artists_with_images(limit_count INT DEFAULT 4)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  monthly_listeners BIGINT,
  followers BIGINT,
  world_rank INT,
  verified BOOLEAN,
  avatar_url TEXT,
  header_url TEXT,
  rank INT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_artists AS (
    SELECT 
      a.id, 
      a.name, 
      a.monthly_listeners, 
      a.followers, 
      a.world_rank, 
      a.verified,
      c.rank
    FROM 
      artists a
    INNER JOIN 
      cached_top_artists c ON a.id = c.artist_id
    ORDER BY 
      c.rank ASC
    LIMIT limit_count
  ),
  artist_images AS (
    SELECT 
      ai.artist_id,
      MAX(CASE WHEN ai.image_type = 'avatar' THEN ai.url ELSE NULL END) as avatar_url,
      MAX(CASE WHEN ai.image_type = 'header' THEN ai.url ELSE NULL END) as header_url
    FROM 
      artist_images ai
    WHERE 
      ai.artist_id IN (SELECT ra.id FROM ranked_artists ra)
      AND ai.image_type IN ('avatar', 'header')
    GROUP BY 
      ai.artist_id
  )
  SELECT 
    ra.id::TEXT, 
    ra.name::TEXT, 
    ra.monthly_listeners::BIGINT, 
    ra.followers::BIGINT, 
    ra.world_rank::INT, 
    ra.verified::BOOLEAN,
    ai.avatar_url::TEXT,
    ai.header_url::TEXT,
    ra.rank::INT
  FROM 
    ranked_artists ra
  LEFT JOIN 
    artist_images ai ON ra.id = ai.artist_id
  ORDER BY 
    ra.rank ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top tracks with all details in a single efficient query
CREATE OR REPLACE FUNCTION get_top_tracks_with_details(limit_count INT DEFAULT 5)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  share_url TEXT,
  explicit BOOLEAN,
  play_count BIGINT,
  duration_ms INT,
  artist_name TEXT,
  album_name TEXT,
  album_image_url TEXT,
  rank INT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_tracks AS (
    SELECT 
      t.id, 
      t.name, 
      t.share_url, 
      t.explicit, 
      t.play_count, 
      t.duration_ms,
      t.album_id,
      c.rank
    FROM 
      tracks t
    INNER JOIN 
      cached_top_tracks c ON t.id = c.track_id
    ORDER BY 
      c.rank ASC
    LIMIT limit_count
  ),
  album_info AS (
    SELECT DISTINCT ON (a.id)
      a.id AS album_id,
      a.name AS album_name,
      ai.url AS album_image_url
    FROM 
      albums a
    LEFT JOIN 
      album_images ai ON a.id = ai.album_id
    WHERE 
      a.id IN (SELECT rt.album_id FROM ranked_tracks rt WHERE rt.album_id IS NOT NULL)
    ORDER BY a.id, ai.url -- Get first image per album
  ),
  artist_info AS (
    SELECT 
      at.track_id,
      a.name AS artist_name
    FROM 
      artist_tracks at
    INNER JOIN 
      artists a ON at.artist_id = a.id
    WHERE 
      at.track_id IN (SELECT rt.id FROM ranked_tracks rt)
      AND at.is_primary = TRUE
  )
  SELECT 
    rt.id::TEXT, 
    rt.name::TEXT, 
    rt.share_url::TEXT, 
    rt.explicit::BOOLEAN, 
    rt.play_count::BIGINT, 
    rt.duration_ms::INT,
    ai.artist_name::TEXT,
    alb.album_name::TEXT,
    alb.album_image_url::TEXT,
    rt.rank::INT
  FROM 
    ranked_tracks rt
  LEFT JOIN 
    artist_info ai ON rt.id = ai.track_id
  LEFT JOIN 
    album_info alb ON rt.album_id = alb.album_id
  ORDER BY 
    rt.rank ASC;
END;
$$ LANGUAGE plpgsql; 