-- Create a simplified attendance table for users at stops
CREATE TABLE IF NOT EXISTS public.attendance_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present_at_stop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add expires_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'attendance_simple' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE attendance_simple 
    ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');
  END IF;
END $$;

-- Add RLS policies
ALTER TABLE public.attendance_simple ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'attendance_simple' 
    AND policyname = 'attendance_simple_select_policy'
  ) THEN
    CREATE POLICY attendance_simple_select_policy 
      ON public.attendance_simple 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'attendance_simple' 
    AND policyname = 'attendance_simple_insert_policy'
  ) THEN
    CREATE POLICY attendance_simple_insert_policy 
      ON public.attendance_simple 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS attendance_simple_user_date_idx 
  ON public.attendance_simple (user_id, date);

-- Create index for expires_at
CREATE INDEX IF NOT EXISTS attendance_simple_expires_at_idx 
  ON public.attendance_simple (expires_at);

-- Create function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_attendance()
RETURNS void AS $$
BEGIN
  DELETE FROM attendance_simple WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup every hour
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_attendance()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_attendance();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS cleanup_expired_attendance_trigger ON attendance_simple;
CREATE TRIGGER cleanup_expired_attendance_trigger
  AFTER INSERT ON attendance_simple
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_attendance();
