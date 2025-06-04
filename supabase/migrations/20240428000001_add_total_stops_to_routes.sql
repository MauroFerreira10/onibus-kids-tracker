-- Add total_stops column to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS total_stops INTEGER NOT NULL DEFAULT 0;

-- Update existing routes with a default value
UPDATE routes SET total_stops = (
  SELECT COUNT(DISTINCT stop_id) 
  FROM students 
  WHERE students.route_id = routes.id
) WHERE total_stops = 0; 