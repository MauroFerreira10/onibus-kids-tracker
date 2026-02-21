import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Bus, Loader2, Navigation, User, Star } from 'lucide-react';
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
  userAssignedStopId?: string;
}

export const StopsList: React.FC<StopsListProps> = ({
  stops,
  attendanceStatus,
  markPresentAtStop,
  user,
  userAssignedStopId
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

  return (
    <div className="space-y-6 mt-6" role="region" aria-label="Lista de paradas da rota">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg flex items-center">
          <Bus className="w-5 h-5 mr-2 text-gray-700" aria-hidden="true" />
          Paradas da Rota
        </h4>
        {isStudent && userAssignedStopId && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <User className="w-3 h-3 mr-1" />
            Sua parada
          </Badge>
        )}
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" role="presentation" />
        
        {stops.map((stop, index) => {
          const isUserStop = userAssignedStopId === stop.id;
          const estimatedInfo = getEstimatedInfo(index);
          
          return (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.2) }}
            className={`relative mb-8 last:mb-0 ${isUserStop ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`}
          >
            <div className="flex items-start">
              {/* Stop icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                  isUserStop 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  {isUserStop ? (
                    <Star className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : (
                    <MapPin className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  )}
                </div>
                {index < stops.length - 1 && (
                  <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gray-300" role="presentation" />
                )}
              </div>
              
              {/* Stop content */}
              <div className="ml-6 flex-1">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${
                    isUserStop 
                      ? 'border-blue-300 bg-blue-50/30' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-gray-900">{stop.name}</h3>
                        {isUserStop && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Star className="w-3 h-3 mr-1" />
                            Sua parada
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          Parada {index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{stop.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200" aria-label={`Horário previsto: ${stop.estimatedTime}`}>
                        <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                        {stop.estimatedTime}
                      </div>
                      {/* Distance/time info */}
                      <div className="flex items-center text-xs text-gray-500 gap-3" aria-label={`Distância: ${estimatedInfo.distance}, Tempo estimado: ${estimatedInfo.time}`}>
                        <div className="flex items-center">
                          <Navigation className="h-3 w-3 mr-1" aria-hidden="true" />
                          {estimatedInfo.distance}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                          {estimatedInfo.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrival notifications */}
                  <div className="mt-4 space-y-2">
                    <BusArrivalNotification stopId={stop.id} />
                    <ArrivalNotification stopId={stop.id} />
                  </div>

                  {/* Attendance status - only for students */}
                  {user && isStudent && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {attendanceStatus[stop.id] === 'present' || attendanceStatus[stop.id] === 'present_at_stop' ? (
                        <div className="flex items-center text-green-700 bg-green-100 px-4 py-2.5 rounded-lg border border-green-200" role="status" aria-live="polite">
                          <CheckCircle2 className="h-5 w-5 mr-2" aria-hidden="true" />
                          <span className="font-medium">Presença confirmada</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleMarkPresent(stop.id)}
                          variant="outline"
                          disabled={loadingStopId === stop.id}
                          className="w-full border-dashed bg-white hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 rounded-lg shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          aria-label={`Confirmar presença na parada ${stop.name}`}
                        >
                          {loadingStopId === stop.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                          )}
                          {loadingStopId === stop.id ? 'Confirmando...' : 'Confirmar presença'}
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};
