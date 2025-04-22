
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

// Token do MapBox - vazio por padrão
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
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    localStorage.setItem('mapboxToken', mapboxTokenInput);
    setMapboxToken(mapboxTokenInput);
    setTokenError(null);
    setMapLoaded(false); // Resetar o estado para forçar o carregamento do mapa
    toast.success('Token do Mapbox salvo! Inicializando mapa...');
  };

  // Função para limpar o mapa atual
  const clearCurrentMap = () => {
    if (map.current) {
      console.log("Limpando mapa existente...");
      map.current.remove();
      map.current = null;
    }
    // Limpar todos os markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    setMapLoaded(false);
  };

  // Função para resetar o token
  const resetToken = () => {
    clearCurrentMap();
    setMapboxToken('');
    localStorage.removeItem('mapboxToken');
    setMapboxTokenInput('');
    setTokenError(null);
    toast.info('Token do Mapbox removido');
  };

  // Inicializar o mapa quando o token for definido
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    // Limpar qualquer mapa existente
    clearCurrentMap();

    try {
      console.log(`Inicializando mapa com token: ${mapboxToken.substring(0, 10)}...`);
      setIsLoading(true);
      
      // Definir o token de acesso do Mapbox
      mapboxgl.accessToken = mapboxToken;
      
      // Verificar dimensões do container
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.error("Erro: Container do mapa com dimensões zero:", 
          mapContainer.current.offsetWidth, mapContainer.current.offsetHeight);
        setTokenError("Erro: O container do mapa tem dimensões zero");
        setIsLoading(false);
        return;
      }
      
      // Criar o mapa
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-46.6333, -23.5505], // São Paulo
        zoom: 12,
        failIfMajorPerformanceCaveat: false,
        attributionControl: false // Remover atribuição padrão
      });
      
      // Adicionar controle de atribuição personalizado
      newMap.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));
      
      // Evento de carregamento do mapa
      newMap.on('load', () => {
        console.log("✅ Mapa carregado com sucesso!");
        setMapLoaded(true);
        setIsLoading(false);
        toast.success('Mapa carregado com sucesso!');
      });
      
      // Tratamento de erros do mapa
      newMap.on('error', (e) => {
        console.error("❌ Erro no mapa:", e);
        const errorMessage = e.error?.message || 'Erro desconhecido ao carregar o mapa';
        setTokenError(`Erro: ${errorMessage}`);
        setIsLoading(false);
        setMapLoaded(false);
        toast.error('Erro ao carregar o mapa');
      });
      
      // Adicionar controles de navegação
      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      // Adicionar controle de geolocalização
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
      
      // Guardar referência do mapa
      map.current = newMap;
      
      // Limpeza na desmontagem do componente
      return clearCurrentMap;
      
    } catch (error) {
      console.error("❌ Erro ao inicializar o mapa:", error);
      const errorMsg = String(error);
      
      if (errorMsg.includes('Use a public access token') || errorMsg.includes('Invalid access token')) {
        setTokenError("Token inválido. Use um token público (começa com pk.)");
      } else if (errorMsg.includes('could not parse source')) {
        setTokenError("Erro ao carregar o estilo do mapa. Verifique seu token.");
      } else {
        setTokenError(`Erro: ${errorMsg}`);
      }
      
      setIsLoading(false);
      setMapLoaded(false);
      clearCurrentMap();
      toast.error('Erro ao inicializar o mapa');
    }
  }, [mapboxToken]);

  // Atualizar marcadores quando os dados dos ônibus mudarem
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log("Pulando atualização de marcadores: mapa não está pronto");
      return;
    }
    
    console.log(`Atualizando ${buses.length} marcadores no mapa`);

    // Remover marcadores que não estão mais na lista
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
      
      // Utilizar SVGs pré-definidos para melhor desempenho
      const isSelected = selectedBusId === bus.id;
      const svgUrl = isSelected ? '/bus-selected.svg' : '/bus.svg';
      
      el.innerHTML = `
        <div class="${isSelected ? 'animate-pulse' : ''}">
          <img src="${svgUrl}" alt="Ônibus" width="40" height="40" />
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectBus) {
          onSelectBus(bus.id);
        }
      });

      try {
        if (markersRef.current[bus.id]) {
          // Atualizar posição do marcador existente
          markersRef.current[bus.id].setLngLat([bus.longitude, bus.latitude]);
        } else {
          // Criar novo marcador
          const marker = new mapboxgl.Marker(el)
            .setLngLat([bus.longitude, bus.latitude])
            .addTo(map.current!);
          markersRef.current[bus.id] = marker;
        }
      } catch (error) {
        console.error(`Erro ao manipular marcador para ônibus ${bus.id}:`, error);
      }
    });

    // Centralizar no ônibus selecionado
    if (selectedBusId && map.current) {
      const selectedBus = buses.find(bus => bus.id === selectedBusId);
      if (selectedBus) {
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
      {/* Formulário de configuração do token */}
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
              className="text-sm"
            />
            <Button
              onClick={saveMapboxToken}
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
      ) : null}

      {/* Container do mapa */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg shadow-md"
        style={{ display: mapboxToken && !tokenError ? 'block' : 'none' }}
      />

      {/* Indicador de carregamento */}
      {isLoading && mapboxToken && !tokenError && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-busapp-primary" />
            <p className="mt-2 text-busapp-primary font-medium">Carregando o mapa...</p>
          </div>
        </div>
      )}

      {/* Botão para redefinir token */}
      {mapboxToken && !tokenError && !isLoading && (
        <button 
          onClick={resetToken}
          className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10 text-sm hover:bg-gray-100 transition-colors"
          title="Alterar Token do Mapbox"
        >
          Alterar Token
        </button>
      )}
    </div>
  );
};

export default MapView;
