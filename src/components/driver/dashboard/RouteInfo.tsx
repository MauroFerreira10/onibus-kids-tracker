
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Bus, MapPin, Clock } from 'lucide-react';

const RouteInfo: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
          Informações da Rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Rota:</span>
            <span>Escola Municipal → Centro</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Pontos de parada:</span>
            <span>12 paradas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Próximo ponto:</span>
            <span className="text-busapp-primary flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Av. Principal, 123
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Previsão:</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              3 minutos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteInfo;
