
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { User, Calendar, Bus } from 'lucide-react';
import { UserData, VehicleData } from '@/types';

interface DriverInfoProps {
  user: UserData | null;
  vehicle: VehicleData | null;
}

const DriverInfo: React.FC<DriverInfoProps> = ({ user, vehicle }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <User className="mr-2 h-5 w-5 text-busapp-primary" />
          Informações do Motorista
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{user?.name || "Motorista"}</h3>
            <p className="text-sm text-gray-500">ID: #{user?.id?.substring(0, 5) || "N/A"}</p>
            <p className="text-sm text-gray-500">Contato: {user?.phone || "N/A"}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-dashed">
          <div className="flex items-center text-sm text-gray-700 mb-1">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>Em serviço hoje: 07:00 - 18:00</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Bus className="h-4 w-4 mr-2 text-gray-500" />
            <span>Ônibus: {vehicle?.model || "Não registrado"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverInfo;
