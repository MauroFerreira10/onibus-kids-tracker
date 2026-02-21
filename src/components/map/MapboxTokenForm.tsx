import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MapPin, Key, ExternalLink } from 'lucide-react';

interface MapboxTokenFormProps {
  tokenError: string | null;
  mapboxTokenInput: string;
  isLoading: boolean;
  onTokenInputChange: (value: string) => void;
  onSaveToken: () => void;
}

const MapboxTokenForm: React.FC<MapboxTokenFormProps> = ({
  tokenError,
  mapboxTokenInput,
  isLoading,
  onTokenInputChange,
  onSaveToken,
}) => {
  useEffect(() => {
    const inputElement = document.getElementById('mapbox-token-input');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSaveToken();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4 rounded-xl z-10"
    >
      <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-center mb-2">Configure o token do Mapbox</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Para visualizar o mapa, você precisa fornecer um token de acesso público do Mapbox.
          <br />
          Obtenha-o em{' '}
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            mapbox.com
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </p>
        
        {tokenError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            <strong>Erro:</strong> {tokenError}
          </motion.div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="mapbox-token-input"
              type="text"
              value={mapboxTokenInput}
              onChange={(e) => onTokenInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cole seu token do Mapbox aqui"
              className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Button
            onClick={onSaveToken}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Configurando...
              </div>
            ) : (
              'Configurar Mapa'
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default MapboxTokenForm;
