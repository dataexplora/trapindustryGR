-- Migration: Remove price_info column
-- Description: This column is no longer needed as we use the structured pricing JSON field

-- First check if events have JSON pricing data
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  -- Count events that have price_info but no pricing data
  SELECT COUNT(*) INTO missing_count
  FROM events 
  WHERE price_info IS NOT NULL 
    AND (pricing IS NULL OR pricing = '[]'::jsonb);
  
  -- If there are events that would lose pricing data, fail the migration
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Cannot remove price_info column: % events would lose pricing data', missing_count;
  END IF;
END $$;

-- If the above didn't fail, we can safely remove the column
ALTER TABLE events DROP COLUMN IF EXISTS price_info; 