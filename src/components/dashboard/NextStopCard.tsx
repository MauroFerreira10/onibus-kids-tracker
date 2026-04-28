
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { BusData } from '@/types';

interface NextStopCardProps {
  bus: BusData;
}

const NextStopCard: React.FC<NextStopCardProps> = ({ bus }) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-safebus-blue" aria-hidden="true" />
          </div>
          <span>Próxima Parada</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{bus.nextStop}</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1 bg-gray-100 rounded">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span className="text-sm">
              Previsão de chegada:{' '}
              <span className="font-semibold text-gray-900">
                {bus.estimatedTimeToNextStop === 0 
                  ? 'Chegando agora' 
                  : `${bus.estimatedTimeToNextStop} minutos`}
              </span>
            </span>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Última atualização: {new Date(bus.lastUpdate).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStopCard;
