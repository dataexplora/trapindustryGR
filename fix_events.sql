-- Update events to have future dates
UPDATE events
SET 
  start_date = NOW() + INTERVAL '7 days', -- One week in the future
  end_date = NOW() + INTERVAL '7 days 4 hours', -- 4 hours after start
  status = 'upcoming'
WHERE 
  status = 'upcoming' AND start_date <= NOW();

-- Make sure all events are properly marked as featured that should be
UPDATE events 
SET is_featured = true 
WHERE id IN ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000');

-- Check if any event_images are missing for these events and insert them if needed
DO $$
DECLARE
  event_id_1 UUID := '550e8400-e29b-41d4-a716-446655440000';
  event_id_2 UUID := '660e8400-e29b-41d4-a716-446655440000';
  poster_count INTEGER;
BEGIN
  -- Check for event 1
  SELECT COUNT(*) INTO poster_count FROM event_images WHERE event_id = event_id_1 AND image_type = 'poster';
  
  IF poster_count = 0 THEN
    INSERT INTO event_images (event_id, url, image_type, position)
    VALUES (event_id_1, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1200&auto=format', 'poster', 0);
  END IF;
  
  -- Check for event 2
  SELECT COUNT(*) INTO poster_count FROM event_images WHERE event_id = event_id_2 AND image_type = 'poster';
  
  IF poster_count = 0 THEN
    INSERT INTO event_images (event_id, url, image_type, position)
    VALUES (event_id_2, 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&h=1200&auto=format', 'poster', 0);
  END IF;
END $$;

-- Verify our data to make sure it looks correct
SELECT 
  e.id, 
  e.title, 
  e.start_date, 
  e.end_date, 
  e.status, 
  e.is_featured,
  (SELECT COUNT(*) FROM event_images WHERE event_id = e.id) AS image_count
FROM events e
ORDER BY e.start_date; 