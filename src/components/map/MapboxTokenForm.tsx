
import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

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
  // Focus no input quando o componente é montado
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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg z-10">
      <h3 className="text-lg font-semibold mb-2">Configure o token do Mapbox</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Para visualizar o mapa, você precisa fornecer um token de acesso público do Mapbox.
        <br />
        Obtenha-o em <a href="https://mapbox.com/" className="text-busapp-primary" target="_blank" rel="noopener noreferrer">mapbox.com</a>
      </p>
      
      {tokenError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm w-full max-w-md">
          <strong>Erro:</strong> {tokenError}
        </div>
      )}
      
      <div className="flex flex-col w-full max-w-md gap-2">
        <p className="text-xs text-gray-500">
          O token público deve começar com "pk."
        </p>
        <Input
          id="mapbox-token-input"
          type="text"
          placeholder="Cole seu token público do Mapbox (pk...)"
          value={mapboxTokenInput}
          onChange={(e) => onTokenInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm"
        />
        <Button
          onClick={onSaveToken}
          className="bg-busapp-primary text-white hover:bg-busapp-accent transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar token'
          )}
        </Button>
      </div>
    </div>
  );
};

export default MapboxTokenForm;
