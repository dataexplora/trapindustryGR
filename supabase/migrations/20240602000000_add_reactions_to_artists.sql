-- Add reaction counters directly to the artists table
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS rocket_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS fire_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS poop_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS flag_count INTEGER NOT NULL DEFAULT 0;

-- Create function to increment a reaction count directly on the artists table
CREATE OR REPLACE FUNCTION increment_artist_reaction(
  artist_id TEXT,
  reaction_type TEXT
) RETURNS VOID AS $$
BEGIN
  IF reaction_type = 'rocket' THEN
    UPDATE public.artists 
    SET rocket_count = rocket_count + 1
    WHERE id = increment_artist_reaction.artist_id;
  ELSIF reaction_type = 'fire' THEN
    UPDATE public.artists 
    SET fire_count = fire_count + 1
    WHERE id = increment_artist_reaction.artist_id;
  ELSIF reaction_type = 'poop' THEN
    UPDATE public.artists 
    SET poop_count = poop_count + 1
    WHERE id = increment_artist_reaction.artist_id;
  ELSIF reaction_type = 'flag' THEN
    UPDATE public.artists 
    SET flag_count = flag_count + 1
    WHERE id = increment_artist_reaction.artist_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the separate artist_reactions table if it exists (cleanup)
DROP TABLE IF EXISTS public.artist_reactions; 