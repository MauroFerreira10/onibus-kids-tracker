
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { Loader2 } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxTokenForm from './map/MapboxTokenForm';
import BusMarkers from './map/BusMarkers';
import { toast } from 'sonner';

const MAPBOX_TOKEN = '';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const {
    mapboxToken,
    mapboxTokenInput,
    setMapboxTokenInput,
    tokenError,
    isLoading,
    setIsLoading,
    saveMapboxToken,
    resetToken
  } = useMapboxToken(MAPBOX_TOKEN);

  const clearCurrentMap = () => {
    if (map.current) {
      console.log("Limpando mapa existente...");
      map.current.remove();
      map.current = null;
    }
    setMapLoaded(false);
  };

  useEffect(() => {
    console.log("MapView montado ou token atualizado:", mapboxToken ? "Token presente" : "Sem token");
    
    if (!mapContainer.current || !mapboxToken) {
      console.log("Container não disponível ou token não definido");
      return;
    }
    
    clearCurrentMap();

    try {
      console.log(`Inicializando mapa com token: ${mapboxToken.substring(0, 10)}...`);
      setIsLoading(true);
      
      mapboxgl.accessToken = mapboxToken;
      
      // Verifica se o container tem dimensões válidas
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.error("Erro: Container do mapa com dimensões zero");
        toast.error("Erro: Container do mapa com dimensões zero");
        setIsLoading(false);
        return;
      }
      
      console.log(`Dimensões do container: ${mapContainer.current.offsetWidth}x${mapContainer.current.offsetHeight}`);
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-46.6333, -23.5505], // São Paulo
        zoom: 12,
        failIfMajorPerformanceCaveat: false,
        attributionControl: false
      });
      
      newMap.addControl(new mapboxgl.AttributionControl({ compact: true }));
      
      newMap.on('load', () => {
        console.log("✅ Mapa carregado com sucesso!");
        setMapLoaded(true);
        setIsLoading(false);
        toast.success('Mapa carregado com sucesso!');
      });
      
      newMap.on('error', (e) => {
        console.error("❌ Erro no mapa:", e);
        toast.error('Erro ao carregar o mapa: ' + e.error?.message || 'Erro desconhecido');
        setIsLoading(false);
      });
      
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      newMap.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );
      
      map.current = newMap;
      
      return clearCurrentMap;
      
    } catch (error) {
      console.error("❌ Erro ao inicializar o mapa:", error);
      toast.error('Erro ao inicializar o mapa: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      setIsLoading(false);
      clearCurrentMap();
    }
  }, [mapboxToken, setIsLoading]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {(!mapboxToken || tokenError) && (
        <MapboxTokenForm
          tokenError={tokenError}
          mapboxTokenInput={mapboxTokenInput}
          isLoading={isLoading}
          onTokenInputChange={setMapboxTokenInput}
          onSaveToken={saveMapboxToken}
        />
      )}

      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ 
          display: mapboxToken && !tokenError ? 'block' : 'none',
          border: '1px solid #ccc',
          borderRadius: '0.5rem'
        }}
      />

      {isLoading && mapboxToken && !tokenError && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-busapp-primary" />
            <p className="mt-2 text-busapp-primary font-medium">Carregando o mapa...</p>
          </div>
        </div>
      )}

      {mapboxToken && !tokenError && !isLoading && (
        <button 
          onClick={resetToken}
          className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10 text-sm hover:bg-gray-100 transition-colors"
          title="Alterar Token do Mapbox"
        >
          Alterar Token
        </button>
      )}

      {map.current && mapLoaded && buses.length > 0 && (
        <BusMarkers
          map={map.current}
          buses={buses}
          selectedBusId={selectedBusId}
          onSelectBus={onSelectBus}
        />
      )}
    </div>
  );
};

export default MapView;
