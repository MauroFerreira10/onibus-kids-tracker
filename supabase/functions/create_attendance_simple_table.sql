
-- Create a simplified attendance table for users at stops
CREATE TABLE IF NOT EXISTS public.attendance_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present_at_stop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Make sure a user can only mark presence once per stop per day
  UNIQUE(user_id, stop_id, date)
);

-- Add RLS policies
ALTER TABLE public.attendance_simple ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own attendance records
CREATE POLICY attendance_simple_select_policy 
  ON public.attendance_simple 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own attendance records
CREATE POLICY attendance_simple_insert_policy 
  ON public.attendance_simple 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Optionally create an index for faster queries
CREATE INDEX IF NOT EXISTS attendance_simple_user_date_idx 
  ON public.attendance_simple (user_id, date);
