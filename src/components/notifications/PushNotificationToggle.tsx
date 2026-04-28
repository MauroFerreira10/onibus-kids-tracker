import React from 'react';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  compact?: boolean;
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({ compact = false }) => {
  const { status, isSubscribed, loading, enableNotifications, disableNotifications } = usePushNotifications();

  if (status === 'unsupported') {
    return compact ? null : (
      <p className="text-xs text-gray-400">Notificações push não suportadas neste navegador.</p>
    );
  }

  if (status === 'denied') {
    return compact ? null : (
      <p className="text-xs text-orange-500">
        Notificações bloqueadas. Activa-as nas definições do navegador.
      </p>
    );
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={isSubscribed ? disableNotifications : enableNotifications}
        disabled={loading}
        title={isSubscribed ? 'Desactivar notificações push' : 'Activar notificações push'}
        className="relative"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isSubscribed ? (
          <BellRing className="h-5 w-5 text-safebus-blue" />
        ) : (
          <Bell className="h-5 w-5 text-gray-400" />
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-blue-50' : 'bg-gray-100'}`}>
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-safebus-blue" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Notificações Push</p>
          <p className="text-xs text-gray-500">
            {isSubscribed
              ? 'Recebes alertas mesmo com o app fechado'
              : 'Activa para receber alertas em tempo real'}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={isSubscribed ? 'outline' : 'default'}
        onClick={isSubscribed ? disableNotifications : enableNotifications}
        disabled={loading}
        className={isSubscribed ? '' : 'bg-safebus-blue hover:bg-safebus-blue-dark text-white'}
      >
        {loading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        {isSubscribed ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );
};

export default PushNotificationToggle;
