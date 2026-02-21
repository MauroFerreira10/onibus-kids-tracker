
CREATE OR REPLACE FUNCTION public.update_vehicle_location(
  veh_id UUID,
  lat FLOAT,
  lng FLOAT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vehicles
  SET 
    last_latitude = lat,
    last_longitude = lng,
    last_location_update = NOW()
  WHERE id = veh_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
