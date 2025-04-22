
import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { BusData } from '@/types';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = '';

interface MapViewProps {
  buses?: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  buses = [], 
  selectedBusId,
  onSelectBus 
}) => {
  const [googleMapsKey, setGoogleMapsKey] = useState<string>(
    localStorage.getItem('googleMapsKey') || GOOGLE_MAPS_API_KEY
  );
  const [keyInput, setKeyInput] = useState<string>('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsKey
  });

  const saveApiKey = () => {
    if (keyInput) {
      localStorage.setItem('googleMapsKey', keyInput);
      setGoogleMapsKey(keyInput);
      toast.success('Chave da API do Google Maps salva com sucesso!');
      window.location.reload();
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem'
  };

  const center = {
    lat: -23.5505,
    lng: -46.6333
  };

  if (!googleMapsKey || googleMapsKey === '') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configure a chave da API do Google Maps</h3>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Para visualizar o mapa, você precisa fornecer uma chave da API do Google Maps.
          <br />
          Obtenha-a em <a href="https://console.cloud.google.com/" className="text-busapp-primary" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a>
        </p>
        <div className="flex flex-col w-full max-w-md gap-2">
          <input
            type="text"
            className="px-3 py-2 border rounded-md"
            placeholder="Cole sua chave da API do Google Maps"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button
            onClick={saveApiKey}
            className="bg-busapp-primary text-white px-4 py-2 rounded-md hover:bg-busapp-accent transition-colors"
          >
            Salvar chave
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!isLoaded ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busapp-primary"></div>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {buses.map((bus) => (
            <Marker
              key={bus.id}
              position={{ lat: bus.latitude, lng: bus.longitude }}
              onClick={() => onSelectBus?.(bus.id)}
              icon={{
                url: selectedBusId === bus.id 
                  ? '/bus-selected.svg' 
                  : '/bus.svg',
                scaledSize: new window.google.maps.Size(30, 30)
              }}
            />
          ))}
        </GoogleMap>
      )}
    </div>
  );
};

export default MapView;
