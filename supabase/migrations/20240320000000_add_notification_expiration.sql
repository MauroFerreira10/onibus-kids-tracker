-- Add expires_at column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notifications_expires_at_idx 
ON public.notifications (expires_at);

-- Create function to clean expired notifications
CREATE OR REPLACE FUNCTION public.clean_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at < NOW();
END;
$$;

-- Create a scheduled job to run the cleanup function daily
SELECT cron.schedule(
  'clean-expired-notifications',
  '0 0 * * *', -- Run at midnight every day
  'SELECT public.clean_expired_notifications()'
); 