
import React from 'react';
import { LocationData } from '@/types';

interface LocationDisplayProps {
  currentLocation: LocationData | null;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ currentLocation }) => {
  // Format coordinates for display
  const formatCoordinates = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toFixed(6);
  };

  // Format speed for display
  const formatSpeed = (speed: number | undefined) => {
    if (speed === undefined || speed === 0) return 'Parado';
    return `${(speed * 3.6).toFixed(1)} km/h`; // Converting from m/s to km/h
  };

  if (!currentLocation) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Latitude</p>
        <p className="font-medium">{formatCoordinates(currentLocation.latitude)}</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Longitude</p>
        <p className="font-medium">{formatCoordinates(currentLocation.longitude)}</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Velocidade</p>
        <p className="font-medium">{formatSpeed(currentLocation.speed)}</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Última Atualização</p>
        <p className="font-medium">{new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default LocationDisplay;
