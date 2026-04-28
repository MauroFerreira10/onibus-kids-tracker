import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PushStatus = 'unsupported' | 'denied' | 'default' | 'granted';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PushStatus>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pushNotificationService.isSupported()) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission as PushStatus);

    // Regista o service worker
    navigator.serviceWorker.register('/sw.js').catch(err =>
      console.warn('Service Worker não registado:', err)
    );

    // Verifica se já tem subscrição
    pushNotificationService.getSubscription().then(sub => {
      setIsSubscribed(!!sub);
    });
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!pushNotificationService.isSupported()) {
      toast.error('O teu navegador não suporta notificações push.');
      return;
    }

    setLoading(true);
    try {
      const sub = await pushNotificationService.subscribe();
      if (!sub) {
        setStatus(Notification.permission as PushStatus);
        if (Notification.permission === 'denied') {
          toast.error('Notificações bloqueadas. Activa-as nas definições do navegador.');
        }
        return;
      }

      setIsSubscribed(true);
      setStatus('granted');

      if (user?.id) {
        await pushNotificationService.saveSubscriptionToServer(user.id, sub);
      }

      toast.success('Notificações push activadas! Receberás alertas mesmo com o app fechado.');
    } catch (err) {
      console.error('Erro ao activar notificações:', err);
      toast.error('Não foi possível activar as notificações.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const disableNotifications = useCallback(async () => {
    setLoading(true);
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      if (user?.id) {
        await pushNotificationService.removeSubscriptionFromServer(user.id);
      }
      toast.info('Notificações push desactivadas.');
    } catch (err) {
      console.error('Erro ao desactivar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const showLocalNotification = useCallback((title: string, body: string) => {
    pushNotificationService.showLocalNotification(title, body);
  }, []);

  return { status, isSubscribed, loading, enableNotifications, disableNotifications, showLocalNotification };
};
