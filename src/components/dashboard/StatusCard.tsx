
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BusData } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusCardProps {
  bus: BusData;
}

const StatusCard: React.FC<StatusCardProps> = ({ bus }) => {
  const getStatusInfo = () => {
    switch (bus.status) {
      case 'active':
        return {
          label: 'Em rota',
          icon: <Bus className="h-5 w-5 text-green-500" />,
          color: 'bg-green-50 text-green-700 border-green-200',
          description: 'O transporte está seguindo conforme a rota planejada.'
        };
      case 'delayed':
        return {
          label: 'Atrasado',
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          description: `O transporte está atrasado aproximadamente ${Math.floor(Math.random() * 10) + 5} minutos.`
        };
      case 'inactive':
        return {
          label: 'Inativo',
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          description: 'O transporte não está em operação no momento.'
        };
      default:
        return {
          label: 'Desconhecido',
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          description: 'Status desconhecido.'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isOnTime = bus.onTime;

  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
            Status da Viagem
          </span>
          <Badge className={statusInfo.color}>
            <div className="flex items-center gap-1.5">
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-600">{statusInfo.description}</p>
          
          <div className="flex items-center">
            <div className="flex items-center text-sm">
              {isOnTime ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                  <span className="text-green-700">No horário</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
                  <span className="text-amber-700">Fora do horário previsto</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  bus.status === 'active' 
                    ? 'bg-green-500' 
                    : bus.status === 'delayed'
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${bus.status === 'active' ? 100 : bus.status === 'delayed' ? 65 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
