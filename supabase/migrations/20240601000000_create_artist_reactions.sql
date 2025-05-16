-- Create the artist reactions table with counters
CREATE TABLE IF NOT EXISTS public.artist_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id TEXT NOT NULL,
  rocket_count INTEGER NOT NULL DEFAULT 0,
  fire_count INTEGER NOT NULL DEFAULT 0,
  poop_count INTEGER NOT NULL DEFAULT 0,
  flag_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS artist_reactions_artist_id_idx ON public.artist_reactions(artist_id);

-- Set up Row Level Security
ALTER TABLE public.artist_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to everyone
CREATE POLICY "Allow anonymous read access to artist_reactions"
  ON public.artist_reactions FOR SELECT
  USING (true);

-- Allow anonymous insert access for new artists
CREATE POLICY "Allow anonymous insert access to artist_reactions"
  ON public.artist_reactions FOR INSERT
  WITH CHECK (true);

-- Allow anonymous update access but only to increment counters
CREATE POLICY "Allow anonymous update access to artist_reactions"
  ON public.artist_reactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to increment a reaction count
CREATE OR REPLACE FUNCTION increment_artist_reaction(
  artist_id TEXT,
  reaction_type TEXT
) RETURNS VOID AS $$
DECLARE
  reaction_exists BOOLEAN;
BEGIN
  -- Check if artist exists in the reactions table
  SELECT EXISTS(SELECT 1 FROM public.artist_reactions WHERE artist_id = increment_artist_reaction.artist_id)
  INTO reaction_exists;

  IF reaction_exists THEN
    -- Update existing record
    IF reaction_type = 'rocket' THEN
      UPDATE public.artist_reactions 
      SET rocket_count = rocket_count + 1, updated_at = now()
      WHERE artist_id = increment_artist_reaction.artist_id;
    ELSIF reaction_type = 'fire' THEN
      UPDATE public.artist_reactions 
      SET fire_count = fire_count + 1, updated_at = now()
      WHERE artist_id = increment_artist_reaction.artist_id;
    ELSIF reaction_type = 'poop' THEN
      UPDATE public.artist_reactions 
      SET poop_count = poop_count + 1, updated_at = now()
      WHERE artist_id = increment_artist_reaction.artist_id;
    ELSIF reaction_type = 'flag' THEN
      UPDATE public.artist_reactions 
      SET flag_count = flag_count + 1, updated_at = now()
      WHERE artist_id = increment_artist_reaction.artist_id;
    END IF;
  ELSE
    -- Insert new record
    INSERT INTO public.artist_reactions (
      artist_id,
      rocket_count,
      fire_count,
      poop_count,
      flag_count
    )
    VALUES (
      increment_artist_reaction.artist_id,
      CASE WHEN reaction_type = 'rocket' THEN 1 ELSE 0 END,
      CASE WHEN reaction_type = 'fire' THEN 1 ELSE 0 END,
      CASE WHEN reaction_type = 'poop' THEN 1 ELSE 0 END,
      CASE WHEN reaction_type = 'flag' THEN 1 ELSE 0 END
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 