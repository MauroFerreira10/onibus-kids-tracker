
CREATE OR REPLACE FUNCTION public.register_vehicle(
  license TEXT,
  mdl TEXT,
  cap INTEGER,
  yr TEXT,
  driver UUID,
  sts TEXT DEFAULT 'active',
  tracking BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vehicle_id UUID;
BEGIN
  INSERT INTO public.vehicles (
    license_plate,
    model,
    capacity,
    year,
    driver_id,
    status,
    tracking_enabled
  ) VALUES (
    license,
    mdl,
    cap,
    yr,
    driver,
    sts,
    tracking
  )
  RETURNING id INTO vehicle_id;
  
  RETURN vehicle_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;
