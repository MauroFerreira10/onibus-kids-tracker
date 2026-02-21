-- Add expires_at column to stop_arrivals table
ALTER TABLE stop_arrivals
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stop_arrivals_expires_at ON stop_arrivals(expires_at);

-- Create function to clean expired stop_arrivals
CREATE OR REPLACE FUNCTION clean_expired_stop_arrivals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM stop_arrivals
  WHERE expires_at < NOW();
END;
$$;

-- Create a scheduled job to run the cleanup function daily at midnight
SELECT cron.schedule(
  'clean-expired-stop-arrivals',
  '0 0 * * *', -- Run at midnight every day
  'SELECT clean_expired_stop_arrivals()'
); 