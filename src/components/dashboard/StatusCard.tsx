
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
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-safebus-blue" aria-hidden="true" />
            </div>
            <span>Status da Viagem</span>
          </div>
          <Badge 
            className={`${statusInfo.color} hover:${statusInfo.color} gap-1.5 px-2.5 py-1 font-medium`} 
            variant="outline"
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{statusInfo.description}</p>
          
          <div className="flex items-center gap-2">
            {isOnTime ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                <span className="text-sm font-medium text-green-700">No horário</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <span className="text-sm font-medium text-amber-700">Fora do horário</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  bus.status === 'active' 
                    ? 'bg-green-500' 
                    : bus.status === 'delayed'
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${bus.status === 'active' ? 100 : bus.status === 'delayed' ? 65 : 0}%` }}
                role="progressbar"
                aria-valuenow={bus.status === 'active' ? 100 : bus.status === 'delayed' ? 65 : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progresso da viagem: ${bus.status === 'active' ? '100' : bus.status === 'delayed' ? '65' : '0'}%`}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
