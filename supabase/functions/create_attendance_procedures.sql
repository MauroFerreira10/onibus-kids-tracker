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

-- Function to record user attendance
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
  
  -- Update the route's passenger count
  UPDATE public.routes
  SET passengers = COALESCE(passengers, 0) + 1
  WHERE id = route_id_param;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
