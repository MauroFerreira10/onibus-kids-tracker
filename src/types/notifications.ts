// Define notification types

export interface Notification {
  id: string;
  type: 'arrival' | 'delay' | 'driver' | 'system' | 'trip_started';
  message: string;
  time: string;
  read: boolean;
  icon: string;
  user_id?: string;
  sender_role?: string;
  created_at?: string;
  expires_at?: string;
}
