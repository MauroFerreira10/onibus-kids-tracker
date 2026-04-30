import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Bus, Loader2, Navigation, Star, Info } from 'lucide-react';
import { StopData } from '@/types';
import { BusArrivalNotification } from '@/components/notifications/BusArrivalNotification';
import { ArrivalNotification } from '@/components/notifications/ArrivalNotification';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';

interface StopsListProps {
  stops: StopData[];
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
  assignedRouteId?: string | null;
  assignedStopId?: string | null;
  thisRouteId?: string;
  userAssignedStopId?: string;
}

export const StopsList: React.FC<StopsListProps> = ({
  stops,
  attendanceStatus,
  markPresentAtStop,
  user,
  assignedRouteId,
  assignedStopId,
  thisRouteId,
}) => {
  const { isStudent } = useUserProfile();
  const [loadingStopId, setLoadingStopId] = useState<string | null>(null);

  const handleMarkPresent = async (stopId: string) => {
    setLoadingStopId(stopId);
    try {
      await markPresentAtStop(stopId);
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
    } finally {
      setLoadingStopId(null);
    }
  };

  // Calcular distância/tempo estimado
  const getEstimatedInfo = (index: number) => {
    const distances = ['0.5 km', '1.2 km', '2.0 km', '2.8 km', '3.5 km'];
    const times = ['2 min', '5 min', '8 min', '12 min', '15 min'];
    return {
      distance: distances[Math.min(index, distances.length - 1)],
      time: times[Math.min(index, times.length - 1)]
    };
  };

  // Esta rota é a rota atribuída ao aluno?
  const isAssignedRoute = assignedRouteId && thisRouteId && assignedRouteId === thisRouteId;

  return (
    <div className="space-y-4 mt-4" role="region" aria-label="Lista de paradas da rota">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center text-gray-800">
          <Bus className="w-4 h-4 mr-2 text-gray-600" aria-hidden="true" />
          Paradas
        </h4>
        {isStudent && isAssignedRoute && assignedStopId && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            <Star className="w-3 h-3 mr-1" />
            A tua rota
          </Badge>
        )}
      </div>

      {/* Aviso para aluno sem rota atribuída */}
      {user && isStudent && !assignedRouteId && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Rota não atribuída</p>
            <p className="text-xs text-amber-700 mt-0.5">O gestor ainda não te atribuiu uma rota. Após a atribuição, poderás confirmar presença.</p>
          </div>
        </div>
      )}

      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" role="presentation" />

        {stops.map((stop, index) => {
          const isUserStop = isAssignedRoute && assignedStopId === stop.id;
          const isPresent = attendanceStatus[stop.id] === 'present' || attendanceStatus[stop.id] === 'present_at_stop';

          return (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.15) }}
              className="relative mb-4 last:mb-0"
            >
              {/* Dot on timeline */}
              <div className={`absolute -left-8 top-3 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 ${
                isPresent
                  ? 'bg-green-500 border-green-500'
                  : isUserStop
                    ? 'bg-safebus-blue border-safebus-blue'
                    : 'bg-white border-gray-300'
              }`}>
                {isPresent
                  ? <CheckCircle2 className="h-3 w-3 text-white" />
                  : isUserStop
                    ? <Star className="h-3 w-3 text-white" />
                    : <MapPin className="h-3 w-3 text-gray-400" />
                }
              </div>

              {/* Card */}
              <div className={`rounded-xl border p-3 sm:p-4 transition-all ${
                isUserStop
                  ? 'border-safebus-blue/40 bg-safebus-blue/5 shadow-sm'
                  : isPresent
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-gray-200 bg-white'
              }`}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{stop.name}</h3>
                      {isUserStop && (
                        <Badge className="bg-safebus-blue/10 text-safebus-blue border-safebus-blue/20 text-[10px] px-1.5 py-0">
                          <Star className="w-2.5 h-2.5 mr-0.5" />
                          A tua
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500 border-gray-200">
                        #{index + 1}
                      </Badge>
                    </div>
                    {stop.address && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{stop.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    {stop.estimatedTime}
                  </div>
                </div>

                {/* Arrival notifications */}
                <div className="mt-2 space-y-1">
                  <BusArrivalNotification stopId={stop.id} />
                  <ArrivalNotification stopId={stop.id} />
                </div>

                {/* Botão presença — apenas na paragem atribuída */}
                {user && isStudent && isUserStop && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {isPresent ? (
                      <div className="flex items-center text-green-700 bg-green-100 px-3 py-2 rounded-lg border border-green-200 text-sm" role="status">
                        <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">Presença confirmada</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleMarkPresent(stop.id)}
                        disabled={loadingStopId === stop.id}
                        className="w-full bg-safebus-blue hover:bg-safebus-blue/90 text-white rounded-lg h-9 text-sm active:scale-95 transition-all"
                      >
                        {loadingStopId === stop.id
                          ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          : <AlertCircle className="h-4 w-4 mr-2" />
                        }
                        {loadingStopId === stop.id ? 'A confirmar...' : 'Confirmar presença'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
