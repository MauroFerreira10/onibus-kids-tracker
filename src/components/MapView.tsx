
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { Loader2, MapPin, Bus } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxTokenForm from './map/MapboxTokenForm';
import BusMarkers from './map/BusMarkers';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

const MAPBOX_TOKEN = '';

// Coordenadas do Lubango, Angola
const LUBANGO_CENTER = {
  lng: 13.4925, 
  lat: -14.9167
};

interface MapViewProps {
  buses?: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  centerOnUser?: boolean;  // Nova propriedade para centralizar no usuário
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
  const userPositionMarker = useRef<mapboxgl.Marker | null>(null);
  
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
    setMapReady(false);
  };

  // Efeito para centralizar no usuário quando centerOnUser é true
  useEffect(() => {
    if (!mapReady || !map.current || !centerOnUser) return;

    // Remover marcador existente se tiver
    if (userPositionMarker.current) {
      userPositionMarker.current.remove();
      userPositionMarker.current = null;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Centralizar mapa na posição do usuário
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            speed: 1.2
          });
          
          // Criar elemento personalizado para o marcador
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.innerHTML = `
            <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md pulse-animation"></div>
          `;
          
          // Adicionar marcador
          userPositionMarker.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
            
          // Adicionar estilo CSS para animação
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
          
          // Configurar observador de localização para atualizações contínuas
          const watchId = navigator.geolocation.watchPosition(
            (newPosition) => {
              const { latitude: newLat, longitude: newLng } = newPosition.coords;
              if (userPositionMarker.current) {
                userPositionMarker.current.setLngLat([newLng, newLat]);
              }
            },
            (error) => {
              console.error("Erro ao obter localização:", error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 5000
            }
          );
          
          // Limpar o observador quando o componente for desmontado
          return () => {
            navigator.geolocation.clearWatch(watchId);
            if (userPositionMarker.current) {
              userPositionMarker.current.remove();
            }
          };
        },
        (error) => {
          console.error("Erro ao obter localização inicial:", error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Permissão de localização negada");
          } else {
            toast.error("Erro ao obter localização");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo seu navegador");
    }
  }, [mapReady, centerOnUser]);

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
        center: [LUBANGO_CENTER.lng, LUBANGO_CENTER.lat],
        zoom: 13,
        failIfMajorPerformanceCaveat: false,
        attributionControl: false
      });
      
      newMap.addControl(new mapboxgl.AttributionControl({ compact: true }));
      
      newMap.on('load', () => {
        console.log("✅ Mapa carregado com sucesso!");
        setMapLoaded(true);
        setIsLoading(false);
        
        // Adicionar um delay para garantir que o mapa está totalmente renderizado
        setTimeout(() => {
          setMapReady(true);
          toast.success('Mapa carregado com sucesso!');
        }, 500);
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
    <div className="relative w-full h-[calc(100vh-14rem)] rounded-lg overflow-hidden bg-gradient-to-b from-busapp-primary/5 to-busapp-primary/10 border border-busapp-primary/20">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {mapReady && buses.length > 0 && (
          <Badge variant="secondary" className="bg-busapp-secondary text-busapp-dark font-medium">
            <Bus className="w-3 h-3 mr-1" />
            {buses.length} ônibus ativos
          </Badge>
        )}
        
        {mapReady && (
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
            <MapPin className="w-3 h-3 mr-1" />
            Lubango, Angola
          </Badge>
        )}
      </div>

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
        className="w-full h-full transition-opacity duration-500"
        style={{ 
          display: mapboxToken && !tokenError ? 'block' : 'none',
          opacity: mapReady ? 1 : 0,
          border: '1px solid #ccc',
          borderRadius: '0.5rem'
        }}
      />

      {isLoading && mapboxToken && !tokenError && (
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-busapp-primary mb-4" />
            <p className="text-xl font-medium text-busapp-primary">Carregando o mapa...</p>
            <p className="text-gray-500 mt-2">Aguarde um momento</p>
          </div>
        </div>
      )}

      {mapboxToken && !tokenError && !isLoading && (
        <button 
          onClick={resetToken}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-md shadow-md z-10 text-sm hover:bg-gray-100 transition-colors"
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
