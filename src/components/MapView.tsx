
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BusData } from '@/types';
import { toast } from 'sonner';

// Você precisará substituir por uma chave válida do MapBox
const MAPBOX_TOKEN = 'suaChaveMapboxAqui';

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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Salvar o token do Mapbox no localStorage
  const saveMapboxToken = () => {
    if (mapboxTokenInput) {
      localStorage.setItem('mapboxToken', mapboxTokenInput);
      setMapboxToken(mapboxTokenInput);
      toast.success('Token do Mapbox salvo com sucesso!');
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-46.6333, -23.5505], // São Paulo coordinates
        zoom: 12
      });

      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Limpar na desmontagem
      return () => {
        map.current?.remove();
        // Limpar todos os markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
      };
    } catch (error) {
      console.error("Erro ao inicializar o mapa:", error);
      toast.error('Erro ao carregar o mapa. Verifique seu token do Mapbox.');
    }
  }, [mapboxToken]);

  // Atualizar marcadores quando os dados dos ônibus mudarem
  useEffect(() => {
    if (!map.current) return;

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
        const marker = new mapboxgl.Marker(el)
          .setLngLat([bus.longitude, bus.latitude])
          .addTo(map.current);
        markersRef.current[bus.id] = marker;
      }
    });

    // Se há um ônibus selecionado, centralizar o mapa nele
    if (selectedBusId) {
      const selectedBus = buses.find(bus => bus.id === selectedBusId);
      if (selectedBus) {
        map.current.flyTo({
          center: [selectedBus.longitude, selectedBus.latitude],
          zoom: 15,
          speed: 0.8
        });
      }
    }
  }, [buses, selectedBusId, onSelectBus]);

  return (
    <div className="relative w-full h-full">
      {(!mapboxToken || mapboxToken === 'suaChaveMapboxAqui') ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg z-10">
          <h3 className="text-lg font-semibold mb-2">Configure o token do Mapbox</h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Para visualizar o mapa, você precisa fornecer um token de acesso público do Mapbox.
            <br />
            Obtenha-o em <a href="https://mapbox.com/" className="text-busapp-primary" target="_blank" rel="noopener noreferrer">mapbox.com</a>
          </p>
          <div className="flex flex-col w-full max-w-md gap-2">
            <input
              type="text"
              className="px-3 py-2 border rounded-md"
              placeholder="Cole seu token público do Mapbox"
              value={mapboxTokenInput}
              onChange={(e) => setMapboxTokenInput(e.target.value)}
            />
            <button
              onClick={saveMapboxToken}
              className="bg-busapp-primary text-white px-4 py-2 rounded-md hover:bg-busapp-accent transition-colors"
            >
              Salvar token
            </button>
          </div>
        </div>
      ) : null}
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-md" />
    </div>
  );
};

export default MapView;
