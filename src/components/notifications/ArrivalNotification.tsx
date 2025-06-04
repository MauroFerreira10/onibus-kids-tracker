import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MapPin } from 'lucide-react';

interface ArrivalNotificationProps {
  stopId: string;
}

export const ArrivalNotification: React.FC<ArrivalNotificationProps> = ({ stopId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!stopId) return;

    // Inscreve para receber notificações de chegada
    const subscription = supabase
      .channel('stop_arrivals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stop_arrivals',
          filter: `stop_id=eq.${stopId}`
        },
        (payload) => {
          // Quando um ônibus chega ou sai, mostra a notificação
          const isArrival = payload.new.status === 'arrived';
          toast.custom((t) => (
            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isArrival ? 'bg-busapp-primary/10' : 'bg-blue-100'}`}>
                {isArrival ? (
                  <Bell className="h-5 w-5 text-busapp-primary" />
                ) : (
                  <MapPin className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{isArrival ? 'Ônibus chegou!' : 'Ônibus saiu!'}</p>
                <p className="text-sm text-gray-500">
                  {isArrival ? 'O ônibus chegou na sua parada' : 'O ônibus saiu da sua parada'}
                </p>
              </div>
            </div>
          ), {
            duration: 5000,
            position: 'top-right'
          });
        }
      )
      .subscribe();

    setIsSubscribed(true);

    return () => {
      subscription.unsubscribe();
      setIsSubscribed(false);
    };
  }, [stopId]);

  return null;
}; 