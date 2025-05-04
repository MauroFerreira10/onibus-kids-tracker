
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
        <p className="text-sm text-center text-gray-500 mt-2">
          Clique no botão acima para iniciar o compartilhamento de sua localização com os pais e alunos.
        </p>
      )}
    </div>
  );
};

export default LocationControls;
