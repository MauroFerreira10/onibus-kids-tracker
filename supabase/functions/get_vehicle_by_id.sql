
CREATE OR REPLACE FUNCTION public.get_vehicle_by_id(
  driver_id UUID
)
RETURNS TABLE (
  id UUID,
  license_plate TEXT,
  model TEXT,
  capacity INTEGER,
  year TEXT,
  driver_id UUID,
  status TEXT,
  tracking_enabled BOOLEAN,
  last_latitude FLOAT,
  last_longitude FLOAT,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT v.*
  FROM public.vehicles v
  WHERE v.driver_id = get_vehicle_by_id.driver_id
  ORDER BY v.created_at DESC
  LIMIT 1;
END;
$$;
