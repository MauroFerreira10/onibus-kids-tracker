
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { BusData } from '@/types';

interface BusMarkersProps {
  map: mapboxgl.Map;
  buses: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
}

const BusMarkers: React.FC<BusMarkersProps> = ({
  map,
  buses,
  selectedBusId,
  onSelectBus
}) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    console.log(`Atualizando ${buses.length} marcadores de ônibus`);
    
    // Remover marcadores que não estão mais na lista
    Object.keys(markersRef.current).forEach(id => {
      if (!buses.find(bus => bus.id === id)) {
        console.log(`Removendo marcador para ônibus ${id}`);
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Adicionar ou atualizar marcadores
    buses.forEach(bus => {
      const el = document.createElement('div');
      el.className = 'bus-marker';
      
      const isSelected = selectedBusId === bus.id;
      const svgUrl = isSelected ? '/bus-selected.svg' : '/bus.svg';
      
      el.innerHTML = `
        <div class="${isSelected ? 'animate-pulse' : ''}">
          <img src="${svgUrl}" alt="Ônibus" width="40" height="40" />
        </div>
      `;

      if (onSelectBus) {
        el.addEventListener('click', () => onSelectBus(bus.id));
      }

      try {
        if (markersRef.current[bus.id]) {
          // Atualizar posição do marcador existente
          markersRef.current[bus.id].setLngLat([bus.longitude, bus.latitude]);
          
          // Atualizar elemento do marcador se o estado de seleção mudou
          const marker = markersRef.current[bus.id];
          const currentEl = marker.getElement();
          if ((isSelected && !currentEl.querySelector('.animate-pulse')) || 
              (!isSelected && currentEl.querySelector('.animate-pulse'))) {
            marker.remove();
            const newMarker = new mapboxgl.Marker(el)
              .setLngLat([bus.longitude, bus.latitude])
              .addTo(map);
            markersRef.current[bus.id] = newMarker;
          }
        } else {
          // Criar novo marcador
          console.log(`Adicionando marcador para ônibus ${bus.id}`);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([bus.longitude, bus.latitude])
            .addTo(map);
          markersRef.current[bus.id] = marker;
        }
      } catch (error) {
        console.error(`Erro ao manipular marcador para ônibus ${bus.id}:`, error);
      }
    });

    // Centralizar no ônibus selecionado
    if (selectedBusId) {
      const selectedBus = buses.find(bus => bus.id === selectedBusId);
      if (selectedBus) {
        console.log(`Centralizando no ônibus ${selectedBusId}`);
        map.flyTo({
          center: [selectedBus.longitude, selectedBus.latitude],
          zoom: 15,
          speed: 0.8
        });
      }
    }
  }, [buses, selectedBusId, onSelectBus, map]);

  return null;
};

export default BusMarkers;
