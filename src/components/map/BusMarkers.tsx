import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { BusData } from '@/types';

interface BusMarkersProps {
  map: mapboxgl.Map;
  buses: BusData[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
}

function createMarkerElement(bus: BusData, isSelected: boolean, onClick: () => void): HTMLDivElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="relative">
      <div class="${isSelected ? 'animate-pulse' : ''}">
        <div class="relative">
          <div class="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-40"></div>
          <div class="relative bg-white rounded-full p-2 shadow-lg border-2 ${isSelected ? 'border-blue-600' : 'border-gray-200'}">
            <svg class="w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-blue-500'}" viewBox="0 0 24 24" fill="none">
              <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M2 8h20" stroke="currentColor" stroke-width="2"/>
              <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
              <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    </div>`;
  el.style.cursor = 'pointer';
  el.addEventListener('click', onClick);
  return el;
}

const BusMarkers: React.FC<BusMarkersProps> = ({ map, buses, selectedBusId, onSelectBus }) => {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const flyToDone = useRef(false);

  useEffect(() => {
    try {
      const markers = markersRef.current;
      const currentIds = new Set(buses.map(b => b.id));

      // Remove markers for buses no longer in list
      markers.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove();
          markers.delete(id);
        }
      });

      // Add or update markers
      buses.forEach(bus => {
        const isSelected = selectedBusId === bus.id;
        const existing = markers.get(bus.id);

        if (existing) {
          const m = existing;
          m.setLngLat([bus.longitude, bus.latitude]);

          const el = m.getElement();
          const wasSelected = el.innerHTML.includes('animate-pulse');
          if (isSelected !== wasSelected) {
            const newEl = createMarkerElement(bus, isSelected, () => onSelectBus?.(bus.id));
            m.setElement(newEl);
          }
        } else {
          const onClick = () => onSelectBus?.(bus.id);
          const el = createMarkerElement(bus, isSelected, onClick);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([bus.longitude, bus.latitude])
            .addTo(map);
          markers.set(bus.id, marker);
        }
      });

      // Fly to selected bus only once per selection
      if (selectedBusId) {
        const bus = buses.find(b => b.id === selectedBusId);
        if (bus && !flyToDone.current) {
          map.flyTo({ center: [bus.longitude, bus.latitude], zoom: 15, speed: 0.8, curve: 1.5 });
          flyToDone.current = true;
        }
      } else {
        flyToDone.current = false;
      }
    } catch (err) {
      console.error('BusMarkers: erro ao actualizar marcadores', err);
    }
  }, [buses, selectedBusId, map]);

  useEffect(() => {
    const markers = markersRef.current;
    return () => { markers.forEach(m => m.remove()); markers.clear(); };
  }, []);

  return null;
};

export default React.memo(BusMarkers);