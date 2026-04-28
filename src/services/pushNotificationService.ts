import { supabase } from '@/integrations/supabase/client';

// VAPID public key — para produção, gere com: npx web-push generate-vapid-keys
// Esta é uma chave de desenvolvimento. Substitua em produção.
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export const pushNotificationService = {
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    return Notification.requestPermission();
  },

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  },

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    const permission = await this.requestPermission();
    if (permission !== 'granted') return null;

    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return existing;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      return subscription;
    } catch (err) {
      console.error('Erro ao subscrever push:', err);
      return null;
    }
  },

  async unsubscribe(): Promise<boolean> {
    const sub = await this.getSubscription();
    if (!sub) return true;
    return sub.unsubscribe();
  },

  // Guarda a subscrição no perfil do utilizador (coluna push_subscription jsonb)
  async saveSubscriptionToServer(userId: string, subscription: PushSubscription): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ push_subscription: subscription.toJSON() as any })
      .eq('id', userId);
    if (error) console.error('Erro ao guardar subscrição push:', error);
  },

  async removeSubscriptionFromServer(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ push_subscription: null })
      .eq('id', userId);
    if (error) console.error('Erro ao remover subscrição push:', error);
  },

  // Exibe uma notificação local (sem servidor) — útil para notificações in-app imediatas
  showLocalNotification(title: string, body: string, icon = '/favicon.ico'): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, { body, icon, badge: '/favicon.ico' });
    });
  },
};
