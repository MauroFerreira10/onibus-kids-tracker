import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { BusData } from '@/types';
import { motion } from 'framer-motion';

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
      
      const isSelected = selectedBusId === bus.id;
      
      // Criar elemento personalizado para o marcador
      el.innerHTML = `
        <div class="relative group">
          <div class="${isSelected ? 'animate-pulse' : ''} transform transition-transform duration-200 group-hover:scale-110">
            <div class="relative">
              <div class="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-40"></div>
              <div class="relative bg-white rounded-full p-2.5 shadow-lg border-2 ${isSelected ? 'border-blue-600' : 'border-gray-200'}">
                <svg class="w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-blue-500'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                  <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div class="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
              ${bus.name || 'Ônibus'}
            </div>
          </div>
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
        map.flyTo({
          center: [selectedBus.longitude, selectedBus.latitude],
          zoom: 15,
          speed: 0.8,
          curve: 1.5
        });
      }
    }
  }, [buses, selectedBusId, onSelectBus, map]);

  return null;
};

export default BusMarkers;
