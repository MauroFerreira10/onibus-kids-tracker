import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { Loader2, MapPin, Bus, Layers, Maximize2, Compass } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxTokenForm from './map/MapboxTokenForm';
import BusMarkers from './map/BusMarkers';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGhlbWF1cmEyMDAyIiwiYSI6ImNtaWl4MG9jaTB1bXkzZHM4enpqOTM3MzUifQ.R38sMigucCZavEJI8wRojw';

const LUBANGO_CENTER = { lng: 13.4925, lat: -14.9167 };

interface MapViewProps {
  buses?: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  centerOnUser?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  buses = [],
  selectedBusId,
  onSelectBus,
  centerOnUser = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const userPositionMarker = useRef<mapboxgl.Marker | null>(null);

  const {
    mapboxToken,
    mapboxTokenInput,
    setMapboxTokenInput,
    tokenError,
    isLoading,
    setIsLoading,
    saveMapboxToken,
    clearInvalidToken,
  } = useMapboxToken(MAPBOX_TOKEN);

  const clearCurrentMap = () => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    setMapLoaded(false);
    setMapReady(false);
  };

  // Geolocalização para centerOnUser
  useEffect(() => {
    if (!mapReady || !map.current || !centerOnUser) return;
    if (userPositionMarker.current) {
      userPositionMarker.current.remove();
      userPositionMarker.current = null;
    }
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:14px;height:14px;border-radius:50%;background:#3B82F6;border:2px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`;
        userPositionMarker.current = new mapboxgl.Marker(el)
          .setLngLat([coords.longitude, coords.latitude])
          .addTo(map.current!);
      },
      () => toast.error('Não foi possível obter a tua localização'),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [mapReady, centerOnUser]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    clearCurrentMap();

    try {
      setIsLoading(true);
      mapboxgl.accessToken = mapboxToken;

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle === 'streets'
          ? 'mapbox://styles/mapbox/streets-v12'
          : 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat],
        zoom: 13,
        attributionControl: false,
        antialias: false,
        fadeDuration: 0,
      });

      newMap.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
      newMap.addControl(
        new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
        'bottom-right'
      );

      newMap.on('load', () => {
        setMapLoaded(true);
        setMapReady(true);
        setIsLoading(false);
      });

      newMap.on('error', (e) => {
        const msg = e.error?.message || '';
        if (msg.includes('invalid') || msg.includes('token') || msg.includes('access token')) {
          clearInvalidToken();
        } else {
          toast.error('Erro ao carregar o mapa');
        }
        setIsLoading(false);
      });

      map.current = newMap;
      return clearCurrentMap;
    } catch {
      toast.error('Erro ao inicializar o mapa');
      setIsLoading(false);
      clearCurrentMap();
    }
  }, [mapboxToken, mapStyle]);

  const resetView = () => {
    if (!map.current) return;
    map.current.easeTo({ center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat], zoom: 13, duration: 800 });
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md"
      style={{ height: 'clamp(320px, 55vw, 600px)' }}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-gray-600">A carregar mapa...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa */}
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ display: mapboxToken && !tokenError ? 'block' : 'none', opacity: mapReady ? 1 : 0, transition: 'opacity 0.4s' }}
      />

      {/* Overlays — top left: info */}
      <AnimatePresence>
        {mapReady && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-3 z-10 flex flex-col gap-2"
          >
            {/* Cidade */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Lubango, Angola</span>
            </div>

            {/* Contador de veículos */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${buses.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-semibold text-gray-700">
                {buses.length > 0 ? `${buses.length} autocarro${buses.length > 1 ? 's' : ''} ativo${buses.length > 1 ? 's' : ''}` : 'Nenhum autocarro ativo'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays — top right: controles */}
      <AnimatePresence>
        {mapReady && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 right-3 z-10 flex flex-col gap-2"
          >
            {/* Trocar estilo */}
            <button
              onClick={() => setMapStyle(s => s === 'streets' ? 'satellite' : 'streets')}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-700 hover:bg-white transition-colors active:scale-95"
              title="Alternar estilo do mapa"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">{mapStyle === 'streets' ? 'Satélite' : 'Ruas'}</span>
            </button>

            {/* Reset view */}
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 text-xs font-medium text-gray-700 hover:bg-white transition-colors active:scale-95"
              title="Centrar no Lubango"
            >
              <Compass className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">Centrar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token form se necessário */}
      {(!mapboxToken || tokenError) && (
        <MapboxTokenForm
          tokenError={tokenError}
          mapboxTokenInput={mapboxTokenInput}
          isLoading={isLoading}
          onTokenInputChange={setMapboxTokenInput}
          onSaveToken={saveMapboxToken}
        />
      )}

      {/* Marcadores dos autocarros */}
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
