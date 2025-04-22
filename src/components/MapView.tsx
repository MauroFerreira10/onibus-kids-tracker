
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Você precisará substituir por uma chave válida do MapBox
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
  const [mapboxTokenInput, setMapboxTokenInput] = useState('');
  const [mapboxToken, setMapboxToken] = useState(
    localStorage.getItem('mapboxToken') || MAPBOX_TOKEN
  );
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Validar e salvar o token do Mapbox no localStorage
  const saveMapboxToken = () => {
    if (!mapboxTokenInput) {
      setTokenError("Por favor, insira um token");
      return;
    }
    
    // Verificar se é um token público (deve começar com pk.)
    if (!mapboxTokenInput.startsWith('pk.')) {
      setTokenError("Use um token público do Mapbox (começa com pk.)");
      return;
    }

    localStorage.setItem('mapboxToken', mapboxTokenInput);
    setMapboxToken(mapboxTokenInput);
    setTokenError(null);
    setMapLoaded(false); // Resetar o estado para forçar o carregamento do mapa
    toast.success('Token do Mapbox salvo com sucesso! Carregando mapa...');
  };

  // Efeito para inicializar o mapa quando o token for definido
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    // Limpar mapa anterior se existir
    if (map.current) {
      console.log("Removendo mapa anterior");
      map.current.remove();
      map.current = null;
      setMapLoaded(false);
    }

    try {
      console.log("Inicializando mapa com token:", mapboxToken.substring(0, 8) + "...");
      mapboxgl.accessToken = mapboxToken;
      
      // Verificar se o contenedor tem tamanho
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.error("Contenedor do mapa com dimensões zero:", 
          mapContainer.current.offsetWidth, mapContainer.current.offsetHeight);
        setTokenError("Erro: O contenedor do mapa tem dimensões zero");
        return;
      }
      
      console.log("Criando mapa em contenedor com dimensões:", 
        mapContainer.current.offsetWidth, mapContainer.current.offsetHeight);
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-46.6333, -23.5505], // São Paulo coordinates
        zoom: 12,
        failIfMajorPerformanceCaveat: false // Tentar renderizar mesmo em condições menos ideais
      });

      newMap.on('load', () => {
        console.log("Mapa carregado com sucesso!");
        setMapLoaded(true);
        toast.success('Mapa carregado com sucesso!');
      });

      newMap.on('error', (e) => {
        console.error("Erro no mapa:", e);
        setTokenError(`Erro no mapa: ${e.error?.message || 'Erro desconhecido'}`);
        toast.error('Erro ao carregar o mapa');
      });

      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

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

      // Limpar na desmontagem
      return () => {
        console.log("Limpando mapa...");
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        // Limpar todos os markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};
      };
    } catch (error) {
      console.error("Erro ao inicializar o mapa:", error);
      
      // Verificar se é o erro específico de token inválido
      const errorString = String(error);
      if (errorString.includes('Use a public access token (pk.*)')) {
        setTokenError("Você precisa usar um token público (começa com pk.)");
      } else if (errorString.includes('could not parse source')) {
        setTokenError("Token inválido ou erro ao carregar o estilo do mapa");
      } else {
        setTokenError(`Erro ao carregar o mapa: ${errorString}`);
        toast.error('Erro ao carregar o mapa. Verifique seu token do Mapbox.');
      }
      setMapLoaded(false);
    }
  }, [mapboxToken]);

  // Atualizar marcadores quando os dados dos ônibus mudarem
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log("Pulando atualização de marcadores: mapa não carregado");
      return;
    }
    
    console.log("Atualizando marcadores, ônibus:", buses.length);

    // Remover marcadores antigos que não estão mais na lista
    Object.keys(markersRef.current).forEach(id => {
      if (!buses.find(bus => bus.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Adicionar ou atualizar marcadores
    buses.forEach(bus => {
      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `
        <div class="${selectedBusId === bus.id ? 'bg-busapp-secondary animate-pulse-slow' : 'bg-busapp-primary'} p-2 rounded-full cursor-pointer shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 8h20" stroke="white" stroke-width="2"/>
            <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="white"/>
            <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="white"/>
          </svg>
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectBus) {
          onSelectBus(bus.id);
        }
      });

      if (markersRef.current[bus.id]) {
        // Atualizar posição do marcador existente
        markersRef.current[bus.id].setLngLat([bus.longitude, bus.latitude]);
      } else {
        // Criar novo marcador
        try {
          const marker = new mapboxgl.Marker(el)
            .setLngLat([bus.longitude, bus.latitude])
            .addTo(map.current!);
          markersRef.current[bus.id] = marker;
        } catch (error) {
          console.error("Erro ao criar marcador:", error);
        }
      }
    });

    // Se há um ônibus selecionado, centralizar o mapa nele
    if (selectedBusId) {
      const selectedBus = buses.find(bus => bus.id === selectedBusId);
      if (selectedBus && map.current) {
        map.current.flyTo({
          center: [selectedBus.longitude, selectedBus.latitude],
          zoom: 15,
          speed: 0.8
        });
      }
    }
  }, [buses, selectedBusId, onSelectBus, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      {(!mapboxToken || tokenError) ? (
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
              type="text"
              placeholder="Cole seu token público do Mapbox (pk...)"
              value={mapboxTokenInput}
              onChange={(e) => setMapboxTokenInput(e.target.value)}
            />
            <Button
              onClick={saveMapboxToken}
              className="bg-busapp-primary text-white hover:bg-busapp-accent transition-colors"
            >
              Salvar token
            </Button>
          </div>
        </div>
      ) : null}

      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg shadow-md"
        style={{ display: mapboxToken && !tokenError ? 'block' : 'none' }}
      />

      {/* Botão para redefinir token */}
      {mapboxToken && !tokenError && (
        <button 
          onClick={() => {
            setMapboxToken('');
            localStorage.removeItem('mapboxToken');
            setMapboxTokenInput('');
            setMapLoaded(false);
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-md shadow z-10 text-sm"
          title="Redefinir Token do Mapbox"
        >
          Alterar Token
        </button>
      )}
    </div>
  );
};

export default MapView;
