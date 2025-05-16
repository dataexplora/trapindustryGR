-- Artist reactions table for tracking user emoji reactions to artists
CREATE TABLE artist_reactions (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('rocket', 'fire', 'poop', 'flag')),
    visitor_id VARCHAR(255) NOT NULL, -- Anonymized unique ID for each visitor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Create a unique constraint to prevent multiple same-type reactions from the same visitor
    UNIQUE(artist_id, reaction_type, visitor_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_artist_reactions_artist_id ON artist_reactions(artist_id);
CREATE INDEX idx_artist_reactions_visitor_id ON artist_reactions(visitor_id);
CREATE INDEX idx_artist_reactions_created_at ON artist_reactions(created_at);

-- Create a view for getting aggregated reaction counts by artist
CREATE VIEW artist_reaction_counts AS
SELECT 
    artist_id,
    reaction_type,
    COUNT(*) as count
FROM
    artist_reactions
GROUP BY
    artist_id, reaction_type;

-- Row-level security policy to only allow inserts (no updates or deletes by clients)
ALTER TABLE artist_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY artist_reactions_insert_policy ON artist_reactions
    FOR INSERT
    WITH CHECK (true);  -- Allow inserts

CREATE POLICY artist_reactions_select_policy ON artist_reactions
    FOR SELECT
    USING (true);  -- Allow reads

-- Function to clean up old reactions (for maintenance)
CREATE OR REPLACE FUNCTION clean_old_reactions()
RETURNS void AS $$
BEGIN
    DELETE FROM artist_reactions
    WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- To run the cleanup function periodically, you can set up a cron job
-- or execute the function manually: SELECT clean_old_reactions();

-- Sample query to get reaction counts for an artist:
-- SELECT reaction_type, COUNT(*) FROM artist_reactions WHERE artist_id = 'some_artist_id' GROUP BY reaction_type;

-- Sample query to check rate limiting for a visitor (3 per hour limit):
-- SELECT COUNT(*) FROM artist_reactions WHERE visitor_id = 'some_visitor_id' AND created_at > NOW() - INTERVAL '1 hour'; 