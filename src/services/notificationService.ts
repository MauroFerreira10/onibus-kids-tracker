import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'arrival' | 'delay' | 'driver' | 'system' | 'trip_started';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  user_id?: string;
  sender_role?: string;
  created_at?: string;
}

export const sendNotification = async (notification: {
  type: NotificationType;
  message: string;
  icon: string;
  user_id?: string;
  sender_role?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        time: new Date().toISOString(),
        read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
};

export const subscribeToNotifications = (callback: (notification: Notification) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();
};
