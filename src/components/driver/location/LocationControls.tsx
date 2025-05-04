
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Power } from 'lucide-react';
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
        <p className="text-sm text-amber-600 text-center mt-2">
          O rastreamento está desativado para este veículo. Ative-o nas configurações do veículo.
        </p>
      )}
    </div>
  );
};

export default LocationControls;
