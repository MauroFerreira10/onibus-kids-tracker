
// Define notification types

export interface Notification {
  id: string;
  type: 'arrival' | 'delay' | 'driver' | 'system';
  message: string;
  time: string;
  read: boolean;
  icon: string;
  user_id?: string;
}
