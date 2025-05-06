
import React from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import { StopData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StopsListProps {
  stops: StopData[];
  attendanceStatus: Record<string, string>;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

export const StopsList = ({ stops, attendanceStatus, markPresentAtStop, user }: StopsListProps) => {
  return (
    <>
      <h4 className="font-semibold mb-2">Paradas em Lubango</h4>
      <ul className="space-y-4">
        {stops.map((stop, index) => (
          <StopItem 
            key={stop.id} 
            stop={stop} 
            index={index} 
            isLast={index === stops.length - 1}
            attendanceStatus={attendanceStatus[stop.id]}
            markPresentAtStop={markPresentAtStop}
            user={user}
          />
        ))}
      </ul>
    </>
  );
};

interface StopItemProps {
  stop: StopData;
  index: number;
  isLast: boolean;
  attendanceStatus?: string;
  markPresentAtStop: (stopId: string) => Promise<void>;
  user: any | null;
}

const StopItem = ({ stop, index, isLast, attendanceStatus, markPresentAtStop, user }: StopItemProps) => {
  return (
    <li className="relative pl-6">
      {!isLast && (
        <div className="absolute left-[0.65rem] top-6 w-0.5 h-full bg-gray-300 -z-10"></div>
      )}
      
      <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-busapp-primary bg-white flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-busapp-primary"></div>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm p-3">
        <h5 className="font-semibold">{stop.name}</h5>
        <p className="text-gray-600 text-sm flex items-center mt-1">
          <MapPin size={14} className="mr-1" />
          {stop.address}
        </p>
        
        <StopTimeInfo 
          scheduledTime={stop.scheduledTime} 
          estimatedTime={stop.estimatedTime} 
        />
        
        {user && (
          <div className="mt-3 flex justify-end">
            {attendanceStatus === 'present_at_stop' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Presença confirmada
              </Badge>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="text-busapp-primary border-busapp-primary/30"
                onClick={() => markPresentAtStop(stop.id)}
              >
                Confirmar presença neste ponto
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

interface StopTimeInfoProps {
  scheduledTime?: string;
  estimatedTime?: string;
}

const StopTimeInfo = ({ scheduledTime, estimatedTime }: StopTimeInfoProps) => {
  return (
    <div className="flex justify-between items-center mt-2 text-sm">
      <div className="text-gray-500">
        <span>Horário planejado:</span>
        <span className="ml-1 font-medium">{scheduledTime}</span>
      </div>
      
      {scheduledTime !== estimatedTime && (
        <div className="text-yellow-600">
          <span>Estimado:</span>
          <span className="ml-1 font-medium">{estimatedTime}</span>
        </div>
      )}
    </div>
  );
};
