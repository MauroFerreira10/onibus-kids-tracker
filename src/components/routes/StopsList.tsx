import React from 'react';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { StopData } from '@/types';
import { BusArrivalNotification } from '@/components/notifications/BusArrivalNotification';
import { ArrivalNotification } from '@/components/notifications/ArrivalNotification';

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
    <div className="space-y-4 mt-4">
      {stops.map((stop, index) => (
        <div key={stop.id} className="relative">
          {/* Linha conectora */}
          {index < stops.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
          )}
          
          <div className="flex items-start">
            {/* Ícone da parada */}
            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-busapp-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-busapp-primary" />
            </div>
            
            {/* Conteúdo da parada */}
            <div className="ml-4 flex-1">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{stop.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{stop.address}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {stop.estimatedTime}
                  </div>
                </div>

                {/* Notificações de chegada */}
                <div className="mt-3">
                  <BusArrivalNotification stopId={stop.id} />
                  <ArrivalNotification stopId={stop.id} />
                </div>

                {/* Status de presença */}
                {user && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    {attendanceStatus[stop.id] === 'present' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span className="text-sm">Presença confirmada</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => markPresentAtStop(stop.id)}
                        className="text-sm text-busapp-primary hover:text-busapp-primary/80"
                      >
                        Confirmar presença
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
