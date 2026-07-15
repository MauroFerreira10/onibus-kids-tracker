import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { MapPin, Layers, Compass } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxTokenForm from './map/MapboxTokenForm';
import BusMarkers from './map/BusMarkers';
import { toast } from 'sonner';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGhlbWF1cmEyMDAyIiwiYSI6ImNtaWl4MG9jaTB1bXkzZHM4enpqOTM3MzUifQ.R38sMigucCZavEJI8wRojw';
const LUBANGO_CENTER = { lng: 13.4925, lat: -14.9167 };

interface MapViewProps {
  buses?: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  centerOnUser?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ buses = [], selectedBusId, onSelectBus, centerOnUser = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const { mapboxToken, mapboxTokenInput, setMapboxTokenInput, tokenError, isLoading, setIsLoading, saveMapboxToken, clearInvalidToken } = useMapboxToken(MAPBOX_TOKEN);

  const handleStyleToggle = useCallback(() => {
    if (!map.current) return;
    const next = mapStyle === 'streets' ? 'satellite' : 'streets';
    const styleUrl = next === 'streets' ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/satellite-streets-v12';
    map.current.setStyle(styleUrl);
    map.current.once('style.load', () => setMapReady(true));
    setMapStyle(next);
  }, [mapStyle]);

  const resetView = useCallback(() => {
    map.current?.easeTo({ center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat], zoom: 13, duration: 800 });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return;

    try {
      setIsLoading(true);
      mapboxgl.accessToken = mapboxToken;

      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat],
        zoom: 13,
        attributionControl: false,
        antialias: false,
        fadeDuration: 0,
      });

      m.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

      m.on('load', () => { setMapReady(true); setIsLoading(false); });
      m.on('error', (e) => {
        const msg = e.error?.message || '';
        if (msg.includes('invalid') || msg.includes('token') || msg.includes('access token')) clearInvalidToken();
        else toast.error('Erro ao carregar o mapa');
        setIsLoading(false);
      });

      map.current = m;
    } catch {
      toast.error('Erro ao inicializar o mapa');
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
      map.current = null;
      setMapReady(false);
    };
  }, [mapboxToken]);

  return (
    <div className="relative w-full h-full bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600">A carregar mapa...</p>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ display: mapboxToken && !tokenError ? 'block' : 'none' }} />

      {mapReady && (
        <>
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Lubango, Angola</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${buses.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-semibold text-gray-700">
                {buses.length > 0 ? `${buses.length} autocarro${buses.length > 1 ? 's' : ''} ativo${buses.length > 1 ? 's' : ''}` : 'Nenhum autocarro ativo'}
              </span>
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button onClick={handleStyleToggle} className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-700 hover:bg-white transition-colors active:scale-95" title="Alternar estilo do mapa">
              <Layers className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">{mapStyle === 'streets' ? 'Satélite' : 'Ruas'}</span>
            </button>
            <button onClick={resetView} className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-700 hover:bg-white transition-colors active:scale-95" title="Centrar no Lubango">
              <Compass className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">Centrar</span>
            </button>
          </div>
        </>
      )}

      {(!mapboxToken || tokenError) && (
        <MapboxTokenForm tokenError={tokenError} mapboxTokenInput={mapboxTokenInput} isLoading={isLoading} onTokenInputChange={setMapboxTokenInput} onSaveToken={saveMapboxToken} />
      )}

      {mapReady && buses.length > 0 && (
        <BusMarkers map={map.current!} buses={buses} selectedBusId={selectedBusId} onSelectBus={onSelectBus} />
      )}
    </div>
  );
};

export default React.memo(MapView, (prev, next) => {
  return prev.selectedBusId === next.selectedBusId && prev.buses === next.buses && prev.centerOnUser === next.centerOnUser && prev.onSelectBus === next.onSelectBus;
});