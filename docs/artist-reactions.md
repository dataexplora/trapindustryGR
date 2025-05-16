# Artist Reactions System

This document describes the artist reactions system for Urban Greece, which allows visitors to react to artists with various emoji reactions without requiring user accounts.

## Overview

Visitors can react to artists with one of four reactions:
- 🚀 Rocket (to the moon)
- 🔥 Fire
- 💩 Poop (trash)
- 🚩 Flag (red flag)

## Database Schema

We use a maximally simple approach by adding reaction counters directly to the artists table:

```sql
ALTER TABLE public.artists ADD COLUMN rocket_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN fire_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN poop_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN flag_count INTEGER NOT NULL DEFAULT 0;
```

This approach:
- Eliminates the need for joins between tables
- Makes queries extremely fast and simple
- Allows easy integration with existing artist data
- Reduces database complexity

## Rate Limiting & Spam Prevention

To prevent spam and abuse without requiring user accounts:

1. Rate limiting is applied per artist (3 reactions per hour maximum for each individual artist)
2. Users can react to as many different artists as they want
3. Users can only use each reaction type once per artist (e.g., can't give multiple rocket reactions to the same artist)
4. All tracking is done client-side using localStorage for maximum privacy

## Implementation Notes

- The database uses a custom function (`increment_artist_reaction`) to handle incrementing the counters directly on the artists table
- All rate limiting and user tracking happens client-side for maximum privacy
- The CompactArtistReactions component provides a clean, minimalist interface for reactions

## UI Integration

### Artist Detail Page
Reactions appear directly below the artist stats grid as a simple row of reaction buttons.
This placement is clean and unobtrusive while still encouraging engagement.

## Adding to a Page

### Standard Implementation (Standalone)
```tsx
import ArtistReactionButtons from '../components/ArtistReactionButtons';

// Inside your component
<ArtistReactionButtons artistId={artistId} />
```

### Compact Implementation (For Stats Areas)
```tsx
import CompactArtistReactions from '../components/CompactArtistReactions';

// Inside your component
<CompactArtistReactions artistId={artistId} className="optional-classes" />
``` 