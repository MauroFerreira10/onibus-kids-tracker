import React from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Bus } from 'lucide-react';
import { StopData } from '@/types';
import { BusArrivalNotification } from '@/components/notifications/BusArrivalNotification';
import { ArrivalNotification } from '@/components/notifications/ArrivalNotification';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-6 mt-6">
      <h4 className="font-semibold text-lg flex items-center">
        <Bus className="w-5 h-5 mr-2 text-blue-500" />
        Paradas da Rota
      </h4>
      
      <div className="relative">
        {/* Linha do tempo vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />
        
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                {index < stops.length - 1 && (
                  <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500" />
                )}
              </div>
              
              {/* Conteúdo da parada */}
              <div className="ml-6 flex-1">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
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
                    <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 mr-1" />
                      {stop.estimatedTime}
                    </div>
                  </div>

                  {/* Notificações de chegada */}
                  <div className="mt-4 space-y-2">
                    <BusArrivalNotification stopId={stop.id} />
                    <ArrivalNotification stopId={stop.id} />
                  </div>

                  {/* Status de presença */}
                  {user && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {attendanceStatus[stop.id] === 'present' ? (
                        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span className="font-medium">Presença confirmada</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => markPresentAtStop(stop.id)}
                          variant="outline"
                          className="w-full border-dashed hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
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
