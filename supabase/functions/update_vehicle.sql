
CREATE OR REPLACE FUNCTION public.update_vehicle(
  veh_id UUID,
  license TEXT,
  mdl TEXT,
  cap INTEGER,
  yr TEXT,
  driver UUID,
  sts TEXT DEFAULT 'active',
  tracking BOOLEAN DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vehicles
  SET
    license_plate = license,
    model = mdl,
    capacity = cap,
    year = yr,
    status = sts,
    tracking_enabled = tracking,
    updated_at = NOW()
  WHERE id = veh_id AND driver_id = driver;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
