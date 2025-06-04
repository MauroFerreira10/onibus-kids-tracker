import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bus, MapPin, Clock } from 'lucide-react';
import { stopService, StopArrival } from '@/services/stopService';
import { supabase } from '@/integrations/supabase/client';

interface BusArrivalNotificationProps {
  stopId?: string;
  vehicleId?: string;
}

export const BusArrivalNotification: React.FC<BusArrivalNotificationProps> = ({
  stopId,
  vehicleId
}) => {
  const [arrivals, setArrivals] = useState<StopArrival[]>([]);

  useEffect(() => {
    // Carregar chegadas iniciais
    const loadArrivals = async () => {
      if (stopId) {
        const stopArrivals = await stopService.getStopArrivals(stopId);
        setArrivals(stopArrivals);
      } else if (vehicleId) {
        const vehicleArrivals = await stopService.getVehicleArrivals(vehicleId);
        setArrivals(vehicleArrivals);
      }
    };

    loadArrivals();

    // Inscrever-se para receber novas notificações
    const subscription = stopService.subscribeToArrivals((payload) => {
      const newArrival = payload.new as StopArrival;
      
      // Verificar se a notificação é relevante para este componente
      if ((stopId && newArrival.stop_id === stopId) || 
          (vehicleId && newArrival.vehicle_id === vehicleId)) {
        
        setArrivals(prev => [newArrival, ...prev].slice(0, 10));

        // Mostrar toast de notificação
        if (newArrival.status === 'arrived') {
          toast.success('Ônibus chegou na parada!', {
            icon: <Bus className="h-5 w-5" />,
            duration: 5000
          });
        } else if (newArrival.status === 'departed') {
          toast.info('Ônibus saiu da parada', {
            icon: <MapPin className="h-5 w-5" />,
            duration: 3000,
            style: {
              background: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE'
            }
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stopId, vehicleId]);

  if (arrivals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {arrivals.map((arrival) => (
        <div
          key={arrival.id}
          className={`p-3 rounded-lg border ${
            arrival.status === 'arrived' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {arrival.status === 'arrived' ? (
                <Bus className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              )}
              <span className="font-medium">
                {arrival.status === 'arrived' ? 'Chegada' : 'Saída'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(arrival.arrival_time).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 