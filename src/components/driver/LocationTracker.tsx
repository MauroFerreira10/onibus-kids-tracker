
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { VehicleData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import LocationDisplay from './location/LocationDisplay';
import LocationControls from './location/LocationControls';
import LocationPermissionMessage from './location/LocationPermissionMessage';

interface LocationTrackerProps {
  vehicle: VehicleData;
  onStatusChange?: (isTracking: boolean) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ vehicle, onStatusChange }) => {
  const { user } = useAuth();
  
  const {
    isTracking,
    currentLocation,
    permissionDenied,
    startTracking,
    stopTracking
  } = useLocationTracking({ 
    vehicle, 
    user, 
    onStatusChange 
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-busapp-primary" />
          Rastreamento de Localização
        </h3>
        
        <div>
          {isTracking ? (
            <Badge variant="default" className="bg-green-600">Ativo</Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">Inativo</Badge>
          )}
        </div>
      </div>

      <LocationPermissionMessage permissionDenied={permissionDenied} />
      
      <div className="space-y-4">
        <LocationDisplay currentLocation={currentLocation} />

        <LocationControls 
          isTracking={isTracking}
          trackingEnabled={vehicle.trackingEnabled}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
        />
      </div>
    </div>
  );
};

export default LocationTracker;
