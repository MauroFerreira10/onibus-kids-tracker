import React from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Bus } from 'lucide-react';
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
}

export const StopsList: React.FC<StopsListProps> = ({
  stops,
  attendanceStatus,
  markPresentAtStop,
  user
}) => {
  const { isStudent } = useUserProfile();

  return (
    <div className="space-y-6 mt-6">
      <h4 className="font-semibold text-lg flex items-center">
        <Bus className="w-5 h-5 mr-2 text-blue-500" />
        Paradas da Rota
      </h4>
      
      <div className="relative">
        {/* Linha do tempo vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/40 to-purple-400/40 backdrop-blur-sm" />
        
        {stops.map((stop, index) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative mb-8 last:mb-0"
          >
            <div className="flex items-start">
              {/* Ícone da parada */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/40">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                {index < stops.length - 1 && (
                  <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gradient-to-b from-blue-400/50 to-purple-400/50" />
                )}
              </div>
              
              {/* Conteúdo da parada */}
              <div className="ml-6 flex-1">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{stop.name}</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Parada {index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{stop.address}</p>
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-700 bg-blue-100/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-blue-200/50 shadow-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {stop.estimatedTime}
                    </div>
                  </div>

                  {/* Notificações de chegada */}
                  <div className="mt-4 space-y-2">
                    <BusArrivalNotification stopId={stop.id} />
                    <ArrivalNotification stopId={stop.id} />
                  </div>

                  {/* Status de presença - apenas para alunos */}
                  {user && isStudent && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {attendanceStatus[stop.id] === 'present' || attendanceStatus[stop.id] === 'present_at_stop' ? (
                        <div className="flex items-center text-green-700 bg-green-100/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-green-200/50 shadow-sm">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span className="font-medium">Presença confirmada</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => markPresentAtStop(stop.id)}
                          variant="outline"
                          className="w-full border-dashed bg-white/60 backdrop-blur-md hover:bg-blue-100/80 hover:text-blue-700 hover:border-blue-300/50 rounded-2xl shadow-sm active:scale-95 transition-all"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Confirmar presença
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
