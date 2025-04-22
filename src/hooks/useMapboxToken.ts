
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useMapboxToken = (initialToken: string = '') => {
  const [mapboxTokenInput, setMapboxTokenInput] = useState('');
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega o token do localStorage ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
      console.log('Token carregado do localStorage:', savedToken.substring(0, 5) + '...');
      setMapboxToken(savedToken);
    } else if (initialToken) {
      console.log('Usando token inicial');
      setMapboxToken(initialToken);
    }
  }, [initialToken]);

  const saveMapboxToken = () => {
    if (!mapboxTokenInput) {
      setTokenError("Por favor, insira um token");
      return;
    }
    
    if (!mapboxTokenInput.startsWith('pk.')) {
      setTokenError("Use um token público do Mapbox (começa com pk.)");
      return;
    }

    console.log('Salvando novo token:', mapboxTokenInput.substring(0, 5) + '...');
    setIsLoading(true);
    localStorage.setItem('mapboxToken', mapboxTokenInput);
    setMapboxToken(mapboxTokenInput);
    setTokenError(null);
    toast.success('Token do Mapbox salvo! Inicializando mapa...');
  };

  const resetToken = () => {
    console.log('Removendo token');
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
