
-- Function to get user attendance status for a specific date
CREATE OR REPLACE FUNCTION public.get_user_attendance_status(user_id_param UUID, date_param DATE)
RETURNS TABLE (stop_id UUID, route_id UUID, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    attendance.stop_id, 
    attendance.route_id, 
    attendance.status
  FROM 
    public.attendance_simple attendance
  WHERE 
    attendance.user_id = user_id_param
    AND attendance.date = date_param;
END;
$$;

-- Function to record user attendance (with duplicate check)
CREATE OR REPLACE FUNCTION public.record_user_attendance(
  user_id_param UUID, 
  stop_id_param UUID, 
  route_id_param UUID, 
  date_param DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if record already exists
  IF EXISTS (
    SELECT 1 FROM public.attendance_simple 
    WHERE user_id = user_id_param 
    AND stop_id = stop_id_param 
    AND date = date_param
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Insert the new attendance record
  INSERT INTO public.attendance_simple (
    user_id, 
    stop_id, 
    route_id, 
    date, 
    status
  ) VALUES (
    user_id_param, 
    stop_id_param, 
    route_id_param, 
    date_param, 
    'present_at_stop'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition if another transaction inserted between check and insert
    RETURN FALSE;
  WHEN OTHERS THEN
    RAISE;
END;
$$;
