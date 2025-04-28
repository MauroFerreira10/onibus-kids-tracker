
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { BusData } from '@/types';

interface NextStopCardProps {
  bus: BusData;
}

const NextStopCard: React.FC<NextStopCardProps> = ({ bus }) => {
  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-busapp-primary" />
          Próxima Parada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{bus.nextStop}</h3>
          <div className="flex items-center text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              Previsão de chegada: {' '}
              <span className="font-medium text-black">
                {bus.estimatedTimeToNextStop === 0 
                  ? 'Chegando agora' 
                  : `${bus.estimatedTimeToNextStop} minutos`}
              </span>
            </span>
          </div>

          <div className="mt-4 pt-2 border-t border-dashed border-gray-200">
            <p className="text-xs text-gray-500">
              Última atualização: {new Date(bus.lastUpdate).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStopCard;
