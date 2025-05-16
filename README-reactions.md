# Adding Artist Reactions Feature to Urban Greece

This feature adds emoji reactions to artist profiles, allowing users to express their opinions using four reaction types: 
- 🚀 Rocket ("To the moon!")
- 🔥 Fire
- 💩 Poop ("Trash")
- 🚩 Red Flag

## Features

- No authentication required - users can react anonymously
- Rate limiting (3 reactions per hour)
- IP-based tracking to prevent spam
- Each user can only react once with each emoji type per artist
- Visual feedback on already-used reactions

## Database Setup

1. Connect to your Supabase database using the SQL Editor
2. Run the SQL script in `database/reaction_schema.sql`

```sql
-- Run this script in your Supabase SQL Editor
CREATE TABLE artist_reactions (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('rocket', 'fire', 'poop', 'flag')),
    visitor_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, reaction_type, visitor_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_artist_reactions_artist_id ON artist_reactions(artist_id);
CREATE INDEX idx_artist_reactions_visitor_id ON artist_reactions(visitor_id);
CREATE INDEX idx_artist_reactions_created_at ON artist_reactions(created_at);
```

3. Set up Row Level Security policies to control access

```sql
-- Row-level security setup
ALTER TABLE artist_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY artist_reactions_insert_policy ON artist_reactions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY artist_reactions_select_policy ON artist_reactions
    FOR SELECT
    USING (true);
```

## How It Works

1. **Visitor Tracking**: 
   - Uses a combination of IP address and user agent to create an anonymous visitor ID
   - Stores this ID in localStorage for persistence
   - No personal information is stored in the database

2. **Rate Limiting**:
   - Limits users to 3 reactions per hour across all artists
   - Simple DB-side rate limiting based on visitor_id and timestamp
   - Shows a helpful message when rate limited

3. **Reaction Storage**:
   - Each reaction stores: artist_id, reaction_type, visitor_id, timestamp
   - Unique constraint prevents duplicate reactions

## Component Usage

Simply add the `ArtistReactionButtons` component to any artist detail page:

```jsx
<ArtistReactionButtons artistId={artist.id} />
```

## Future Improvements

- Add sorting of artists by reaction counts
- Create a "trending" page based on reaction activity
- Add expiration to reactions (e.g., expire after 6 months to keep data fresh)
- Add analytics dashboard for reaction trends over time 