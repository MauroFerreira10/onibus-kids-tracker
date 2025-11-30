
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
    
    // Remove espaços em branco
    const trimmedToken = mapboxTokenInput.trim();
    
    if (!trimmedToken.startsWith('pk.')) {
      setTokenError("Use um token público do Mapbox (começa com pk.)");
      return;
    }

    console.log('Salvando novo token:', trimmedToken.substring(0, 5) + '...');
    setIsLoading(true);
    localStorage.setItem('mapboxToken', trimmedToken);
    setMapboxToken(trimmedToken);
    setTokenError(null);
    toast.success('Token do Mapbox salvo! Inicializando mapa...');
  };

  // Função para limpar token inválido (pode ser chamada externamente)
  const clearInvalidToken = () => {
    setMapboxToken('');
    localStorage.removeItem('mapboxToken');
    setTokenError('Token inválido. Por favor, configure um novo token.');
    toast.error('Token do Mapbox inválido. Configure um novo token.');
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
    clearInvalidToken,
  };
};
