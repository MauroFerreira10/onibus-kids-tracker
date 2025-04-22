
import { useState } from 'react';
import { toast } from 'sonner';

export const useMapboxToken = (initialToken: string = '') => {
  const [mapboxTokenInput, setMapboxTokenInput] = useState('');
  const [mapboxToken, setMapboxToken] = useState(
    localStorage.getItem('mapboxToken') || initialToken
  );
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveMapboxToken = () => {
    if (!mapboxTokenInput) {
      setTokenError("Por favor, insira um token");
      return;
    }
    
    if (!mapboxTokenInput.startsWith('pk.')) {
      setTokenError("Use um token público do Mapbox (começa com pk.)");
      return;
    }

    setIsLoading(true);
    localStorage.setItem('mapboxToken', mapboxTokenInput);
    setMapboxToken(mapboxTokenInput);
    setTokenError(null);
    toast.success('Token do Mapbox salvo! Inicializando mapa...');
  };

  const resetToken = () => {
    setMapboxToken('');
    localStorage.removeItem('mapboxToken');
    setMapboxTokenInput('');
    setTokenError(null);
    toast.info('Token do Mapbox removido');
  };

  return {
    mapboxToken,
    mapboxTokenInput,
    setMapboxTokenInput,
    tokenError,
    isLoading,
    setIsLoading,
    saveMapboxToken,
    resetToken,
  };
};
