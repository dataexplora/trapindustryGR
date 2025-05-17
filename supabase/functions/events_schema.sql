-- Events feature schema

-- Main events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  event_type TEXT NOT NULL, -- 'concert', 'dance_contest', 'street_event', etc.
  ticket_url TEXT,
  price_info TEXT,
  organizer TEXT,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'canceled'
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events (start_date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);
CREATE INDEX IF NOT EXISTS events_city_idx ON events (city);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events (event_type);

-- Images for events
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'poster', 'venue', 'gallery', etc.
  position INTEGER DEFAULT 0, -- For ordering multiple images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connecting events to artists
CREATE TABLE IF NOT EXISTS event_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id TEXT REFERENCES artists(id) ON DELETE SET NULL,
  is_headliner BOOLEAN DEFAULT false
);

-- Tags for events
CREATE TABLE IF NOT EXISTS event_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- Create index for tag-based queries
CREATE INDEX IF NOT EXISTS event_tags_tag_idx ON event_tags (tag);

-- Row level security policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for events" 
ON events FOR SELECT USING (true);

CREATE POLICY "Public read access for event_images" 
ON event_images FOR SELECT USING (true);

CREATE POLICY "Public read access for event_artists" 
ON event_artists FOR SELECT USING (true);

CREATE POLICY "Public read access for event_tags" 
ON event_tags FOR SELECT USING (true);

-- Functions to manage events
CREATE OR REPLACE FUNCTION get_upcoming_events(limit_count INT DEFAULT 10, offset_count INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  city TEXT,
  event_type TEXT,
  status TEXT,
  is_featured BOOLEAN,
  poster_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH event_posters AS (
    SELECT DISTINCT ON (ei.event_id) 
      ei.event_id,
      ei.url
    FROM 
      event_images ei
    WHERE 
      ei.image_type = 'poster'
  )
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.venue_name,
    e.city,
    e.event_type,
    e.status,
    e.is_featured,
    ep.url as poster_url
  FROM 
    events e
  LEFT JOIN 
    event_posters ep ON e.id = ep.event_id
  WHERE 
    e.status = 'upcoming' AND e.start_date >= NOW()
  ORDER BY 
    e.start_date ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql; 