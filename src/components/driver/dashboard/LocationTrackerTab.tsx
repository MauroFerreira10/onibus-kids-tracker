
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleData } from '@/types';
import MapView from '@/components/MapView';
import LocationTracker from '@/components/driver/LocationTracker';

interface LocationTrackerTabProps {
  vehicle: VehicleData | null;
  isTracking: boolean;
  setIsTracking: (value: boolean) => void;
  buses: any[];
  selectedBusId: string | undefined;
  setSelectedBusId: (id: string | undefined) => void;
  onRegisterVehicle: () => void;
}

const LocationTrackerTab: React.FC<LocationTrackerTabProps> = ({
  vehicle,
  isTracking,
  setIsTracking,
  buses,
  selectedBusId,
  setSelectedBusId,
  onRegisterVehicle
}) => {
  if (!vehicle) {
    return (
      <Card className="border shadow-sm text-center p-8">
        <div className="mb-6">
          <div className="rounded-full bg-busapp-primary/10 p-3 inline-block mb-4">
            <MapPin className="h-8 w-8 text-busapp-primary" />
          </div>
          <h3 className="text-xl font-medium">Rastreamento Não Disponível</h3>
          <p className="text-gray-500 mt-2">
            Você precisa registrar um veículo antes de usar o rastreamento de localização.
          </p>
        </div>
        <Button onClick={onRegisterVehicle}>
          Registrar Veículo
        </Button>
      </Card>
    );
  }

  return (
    <>
      <LocationTracker 
        vehicle={vehicle}
        onStatusChange={setIsTracking}
      />
      
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapView 
          buses={buses} 
          selectedBusId={selectedBusId} 
          onSelectBus={setSelectedBusId}
          centerOnUser={isTracking}
        />
      </div>
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Route className="mr-2 h-5 w-5 text-busapp-primary" />
            Informações de Rastreamento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="mb-2">
            Quando o rastreamento está ativo:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sua localização é compartilhada com os pais e alunos da sua rota</li>
            <li>Os dados são atualizados automaticamente a cada poucos segundos</li>
            <li>O rastreamento é automaticamente desativado quando você finaliza a viagem</li>
            <li>O rastreamento funciona apenas quando o aplicativo está aberto</li>
          </ul>
          <div className="bg-amber-50 p-3 rounded-md mt-4">
            <p className="text-amber-800">
              <strong>Nota:</strong> Certifique-se de que a permissão de localização está ativada no seu navegador ou dispositivo.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LocationTrackerTab;
