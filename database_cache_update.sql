-- Update cache tables to include complete data for faster retrieval

-- Check if the columns already exist before adding them
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cached_top_artists' AND column_name = 'complete_data'
    ) THEN
        ALTER TABLE cached_top_artists ADD COLUMN complete_data JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cached_top_tracks' AND column_name = 'complete_data'
    ) THEN
        ALTER TABLE cached_top_tracks ADD COLUMN complete_data JSONB;
    END IF;
END
$$;

-- Create or update cache tables for top artists and tracks

-- Check if cached_top_artists table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cached_top_artists'
    ) THEN
        CREATE TABLE cached_top_artists (
            id SERIAL PRIMARY KEY,
            artist_id TEXT NOT NULL,
            rank INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Check if cached_top_tracks table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cached_top_tracks'
    ) THEN
        CREATE TABLE cached_top_tracks (
            id SERIAL PRIMARY KEY,
            track_id TEXT NOT NULL,
            rank INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_cached_top_artists_rank ON cached_top_artists(rank);
CREATE INDEX IF NOT EXISTS idx_cached_top_tracks_rank ON cached_top_tracks(rank);
CREATE INDEX IF NOT EXISTS idx_cached_top_artists_artist_id ON cached_top_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_cached_top_tracks_track_id ON cached_top_tracks(track_id); 