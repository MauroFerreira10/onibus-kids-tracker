
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Power, AlertTriangle } from 'lucide-react';
import { VehicleData } from '@/types';

interface LocationControlsProps {
  isTracking: boolean;
  trackingEnabled: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

const LocationControls: React.FC<LocationControlsProps> = ({
  isTracking,
  trackingEnabled,
  onStartTracking,
  onStopTracking
}) => {
  return (
    <div className="space-y-2">
      {isTracking ? (
        <Button 
          onClick={onStopTracking} 
          variant="destructive"
          className="w-full"
        >
          <Power className="mr-2 h-4 w-4" />
          Parar Rastreamento
        </Button>
      ) : (
        <Button 
          onClick={onStartTracking} 
          className="w-full"
          disabled={!trackingEnabled}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Iniciar Rastreamento
        </Button>
      )}
      
      {!trackingEnabled && (
        <div className="bg-amber-50 p-3 rounded-md text-center mt-2 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
          <p className="text-sm text-amber-600">
            O rastreamento está desativado para este veículo. Ative-o nas configurações do veículo.
          </p>
        </div>
      )}
      
      {trackingEnabled && !isTracking && (
        <div className="bg-blue-50 p-3 rounded-md text-center mt-2">
          <p className="text-sm text-blue-700">
            Quando o rastreamento estiver ativo, sua localização será compartilhada com os pais e alunos em tempo real.
          </p>
        </div>
      )}
      
      {isTracking && (
        <div className="bg-green-50 p-3 rounded-md text-center mt-2">
          <p className="text-sm text-green-700">
            Rastreamento ativo! Os pais e alunos podem ver a localização do veículo em tempo real.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationControls;
