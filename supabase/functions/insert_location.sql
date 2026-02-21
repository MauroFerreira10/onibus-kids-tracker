
CREATE OR REPLACE FUNCTION public.insert_location(
  driver_id UUID,
  vehicle_id UUID,
  lat FLOAT,
  lng FLOAT,
  spd FLOAT DEFAULT 0,
  dir FLOAT DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.locations (
    driver_id,
    vehicle_id,
    latitude,
    longitude,
    speed,
    direction
  ) VALUES (
    driver_id,
    vehicle_id,
    lat,
    lng,
    spd,
    dir
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
