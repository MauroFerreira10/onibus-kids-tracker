import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MapPin, Bus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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
          const currentTime = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={`bg-white rounded-xl shadow-xl p-4 flex items-start space-x-4 border ${
                isArrival 
                  ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                  : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                isArrival 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {isArrival ? (
                  <Bus className="h-6 w-6" />
                ) : (
                  <MapPin className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {isArrival ? 'Ônibus Chegou!' : 'Ônibus Saiu!'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentTime}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">
                  {isArrival 
                    ? 'O ônibus chegou na sua parada. Prepare-se para embarcar!' 
                    : 'O ônibus saiu da sua parada. Até a próxima!'}
                </p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <Bell className="h-4 w-4 mr-1" />
                  Notificação em tempo real
                </div>
              </div>
            </motion.div>
          ), {
            duration: 5000,
            position: 'top-right',
            style: {
              background: 'transparent',
              boxShadow: 'none',
              border: 'none'
            }
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