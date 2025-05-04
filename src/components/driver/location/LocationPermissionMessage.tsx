
import React from 'react';

interface LocationPermissionMessageProps {
  permissionDenied: boolean;
}

const LocationPermissionMessage: React.FC<LocationPermissionMessageProps> = ({ permissionDenied }) => {
  if (!permissionDenied) return null;
  
  return (
    <div className="bg-red-50 p-3 rounded-md mb-4">
      <p className="text-red-600 text-sm">
        Acesso à localização foi negado. Por favor, permita o acesso nas configurações do seu navegador.
      </p>
    </div>
  );
};

export default LocationPermissionMessage;
