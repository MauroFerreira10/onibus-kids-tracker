
-- Enable Row-Level Security on the student_attendance table
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- Add the student_attendance table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_attendance;

-- Make sure we have full row data on updates
ALTER TABLE public.student_attendance REPLICA IDENTITY FULL;
