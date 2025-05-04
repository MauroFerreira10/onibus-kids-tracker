
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VehicleData } from '@/types';

interface VehicleInfoProps {
  vehicle: VehicleData;
  onUpdateVehicle: () => void;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle, onUpdateVehicle }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bus className="mr-2 h-5 w-5 text-busapp-primary" />
          Informações do Veículo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Placa</h3>
            <p className="font-medium">{vehicle.licensePlate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Capacidade</h3>
            <p className="font-medium">{vehicle.capacity} alunos</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ano</h3>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <Badge 
              className={`
                ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                ${vehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : ''}
                ${vehicle.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
              `}
            >
              {vehicle.status === 'active' ? 'Ativo' : 
               vehicle.status === 'maintenance' ? 'Em Manutenção' : 'Inativo'}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Rastreamento</h3>
            <Badge 
              variant={vehicle.trackingEnabled ? "default" : "outline"}
              className={vehicle.trackingEnabled ? 'bg-blue-600' : ''}
            >
              {vehicle.trackingEnabled ? 'Ativado' : 'Desativado'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onUpdateVehicle}>
          Atualizar Informações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleInfo;
