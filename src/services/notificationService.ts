
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up a subscription to trip notifications
 */
export const subscribeToTripNotifications = () => {
  // Subscribe to trip_started events
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: 'type=eq.trip_started'
      },
      (payload) => {
        // Return the notification data for processing by the hook
        return payload.new;
      }
    )
    .subscribe();
    
  return channel;
};
