import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { Loader2, MapPin, Bus, Navigation, Layers, Compass, Maximize2, Crosshair } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxTokenForm from './map/MapboxTokenForm';
import BusMarkers from './map/BusMarkers';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Tenta obter o token do Mapbox da variável de ambiente, caso contrário usa um token padrão
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGhlbWF1cmEyMDAyIiwiYSI6ImNtaWl4MG9jaTB1bXkzZHM4enpqOTM3MzUifQ.R38sMigucCZavEJI8wRojw';

// Coordenadas do Lubango, Angola
const LUBANGO_CENTER = {
  lng: 13.4925, 
  lat: -14.9167
};

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
  centerOnUser = false
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
    resetToken,
    clearInvalidToken
  } = useMapboxToken(MAPBOX_TOKEN);

  const clearCurrentMap = () => {
    if (map.current) {
      console.log("Limpando mapa existente...");
      map.current.remove();
      map.current = null;
    }
    setMapLoaded(false);
    setMapReady(false);
  };

  // Efeito para centralizar no usuário quando centerOnUser é true
  useEffect(() => {
    if (!mapReady || !map.current || !centerOnUser) return;

    if (userPositionMarker.current) {
      userPositionMarker.current.remove();
      userPositionMarker.current = null;
    }

    if (navigator.geolocation) {
      let retryCount = 0;
      const maxRetries = 3;
      const timeout = 60000;

      const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.innerHTML = `
              <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md pulse-animation"></div>
            `;
            
            userPositionMarker.current = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
              
            const style = document.createElement('style');
            style.textContent = `
              .pulse-animation {
                box-shadow: 0 0 0 rgba(66, 133, 244, 0.4);
                animation: pulse 2s infinite;
              }
              @keyframes pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
                }
              }
            `;
            document.head.appendChild(style);
            
            const watchId = navigator.geolocation.watchPosition(
              (newPosition) => {
                const { latitude: newLat, longitude: newLng } = newPosition.coords;
                if (userPositionMarker.current) {
                  userPositionMarker.current.setLngLat([newLng, newLat]);
                }
              },
              (error) => {
                console.error("Erro ao obter localização:", error);
                handleLocationError(error);
              },
              {
            enableHighAccuracy: false,
            maximumAge: 300000,
                timeout: timeout
              }
            );
            
            return () => {
              navigator.geolocation.clearWatch(watchId);
              if (userPositionMarker.current) {
                userPositionMarker.current.remove();
              }
            };
          },
          (error) => {
            console.error("Erro ao obter localização inicial:", error);
            handleLocationError(error);
          },
          {
            enableHighAccuracy: false,
            timeout: timeout,
            maximumAge: 300000
          }
        );
      };

      const handleLocationError = (error: GeolocationPositionError) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Permissão de localização negada");
          return;
        }

        if (retryCount < maxRetries) {
          retryCount++;
          toast.info(`Tentando obter localização novamente (${retryCount}/${maxRetries})...`);
          setTimeout(getLocation, 2000);
        } else {
          toast.error("Não foi possível obter sua localização após várias tentativas");
        }
      };

      getLocation();
    } else {
      toast.error("Geolocalização não suportada pelo seu navegador");
    }
  }, [mapReady, centerOnUser]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    clearCurrentMap();

    try {
      setIsLoading(true);
      
      mapboxgl.accessToken = mapboxToken;
      
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.error("Erro: Container do mapa com dimensões zero");
        toast.error("Erro: Container do mapa com dimensões zero");
        setIsLoading(false);
        return;
      }
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle === 'streets' ? 'mapbox://styles/mapbox/streets-v11' : 'mapbox://styles/mapbox/satellite-v9',
        center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat],
        zoom: 13,
        failIfMajorPerformanceCaveat: false,
        attributionControl: false,
        // Otimizações de performance
        antialias: false, // Desabilita antialiasing para melhor performance
        preserveDrawingBuffer: false, // Melhora performance
        refreshExpiredTiles: false, // Evita recarregar tiles expirados
        maxTileCacheSize: 50, // Limita cache de tiles
        fadeDuration: 0, // Remove fade para carregamento mais rápido
      });
      
      newMap.addControl(new mapboxgl.AttributionControl({ compact: true }));
      
      newMap.on('load', () => {
        setMapLoaded(true);
        setMapReady(true);
        setIsLoading(false);
        // Removido toast para não interromper o fluxo
      });
      
      newMap.on('error', (e) => {
        console.error("❌ Erro no mapa:", e);
        const errorMessage = e.error?.message || 'Erro desconhecido';
        
        // Verifica se é um erro de token inválido
        if (errorMessage.includes('invalid') || errorMessage.includes('token') || errorMessage.includes('access token')) {
          clearInvalidToken();
        } else {
          toast.error('Erro ao carregar o mapa: ' + errorMessage);
        }
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
  }, [mapboxToken, mapStyle, setIsLoading]);

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets');
  };

  return (
    <div className="relative w-full h-[calc(100vh-14rem)] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-xl">
      {/* Loading State */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-safebus-yellow/5 to-white flex flex-col items-center justify-center z-20"
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping" />
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 relative z-10" />
            </div>
            <p className="text-xl font-semibold text-blue-900 mt-6">Carregando mapa...</p>
            <p className="text-sm text-gray-500 mt-2">Inicializando sistema de mapeamento</p>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full transition-all duration-500"
        style={{ 
          display: mapboxToken && !tokenError ? 'block' : 'none',
          opacity: mapReady ? 1 : 0,
          borderRadius: '0.75rem'
        }}
      />

      {/* Overlays - Top Left */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
        <AnimatePresence>
          {mapReady && buses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl p-3 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Bus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Veículos Ativos</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">{buses.length}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {mapReady && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl p-3 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">Lubango, Angola</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays - Top Right */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        {mapReady && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMapStyle}
              className="bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border-gray-200/50 hover:border-gray-300 transition-all duration-200 h-auto py-2.5 px-3"
            >
              <Layers className="w-4 h-4 mr-2" />
              <span className="font-medium">{mapStyle === 'streets' ? 'Ver Satélite' : 'Ver Ruas'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (map.current) {
                  map.current.easeTo({ bearing: 0, duration: 1000 });
                }
              }}
              className="bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border-gray-200/50 hover:border-gray-300 transition-all duration-200 h-auto py-2.5 px-3"
            >
              <Compass className="w-4 h-4 mr-2" />
              <span className="font-medium">Norte</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (map.current) {
                  map.current.fitBounds(
                    new mapboxgl.LngLatBounds(
                      [LUBANGO_CENTER.lng - 0.1, LUBANGO_CENTER.lat - 0.1],
                      [LUBANGO_CENTER.lng + 0.1, LUBANGO_CENTER.lat + 0.1]
                    ),
                    { padding: 50, duration: 1000 }
                  );
                }
              }}
              className="bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border-gray-200/50 hover:border-gray-300 transition-all duration-200 h-auto py-2.5 px-3"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              <span className="font-medium">Zoom Total</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Token Error Dialog */}
      {(!mapboxToken || tokenError) && (
        <MapboxTokenForm
          tokenError={tokenError}
          mapboxTokenInput={mapboxTokenInput}
          isLoading={isLoading}
          onTokenInputChange={setMapboxTokenInput}
          onSaveToken={saveMapboxToken}
        />
      )}

      {/* Bus Markers */}
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
