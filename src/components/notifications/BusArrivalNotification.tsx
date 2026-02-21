import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bus, MapPin, Clock, ArrowRight } from 'lucide-react';
import { stopService, StopArrival } from '@/services/stopService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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

    // Limpar chegadas expiradas periodicamente e recarregar
    const cleanupInterval = setInterval(async () => {
      await loadArrivals();
    }, 60000); // A cada minuto

    // Inscrever-se para receber novas notificações
    const subscription = stopService.subscribeToArrivals((payload) => {
      const newArrival = payload.new as StopArrival;
      
      // Verificar se a notificação é relevante para este componente
      if ((stopId && newArrival.stop_id === stopId) || 
          (vehicleId && newArrival.vehicle_id === vehicleId)) {
        
        // Recarregar chegadas para garantir que apenas não expiradas apareçam
        loadArrivals();

        // Mostrar toast de notificação
        if (newArrival.status === 'arrived') {
          toast.success('Ônibus chegou na parada!', {
            icon: <Bus className="h-5 w-5" />,
            duration: 5000,
            style: {
              background: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0'
            }
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
      clearInterval(cleanupInterval);
    };
  }, [stopId, vehicleId]);

  if (arrivals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-gray-700 flex items-center">
        <Bus className="h-4 w-4 mr-2 text-blue-500" />
        Histórico de Chegadas
      </h5>
      
      <AnimatePresence>
        {arrivals.map((arrival, index) => (
          <motion.div
            key={arrival.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${
              arrival.status === 'arrived' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            } shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  arrival.status === 'arrived' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {arrival.status === 'arrived' ? (
                    <Bus className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {arrival.status === 'arrived' ? 'Chegada' : 'Saída'}
                    </span>
                    <Badge variant="outline" className={
                      arrival.status === 'arrived' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }>
                      {new Date(arrival.arrival_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {arrival.status === 'arrived' 
                      ? 'Ônibus chegou na parada' 
                      : 'Ônibus saiu da parada'}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 