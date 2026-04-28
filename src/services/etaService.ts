import { supabase } from '@/integrations/supabase/client';

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence_number: number;
}

interface ETAResult {
  stopId: string;
  stopName: string;
  etaMinutes: number;
  distanceKm: number;
}

// Haversine: distância em km entre dois pontos GPS
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Velocidade média urbana em km/h quando não temos dado de GPS
const DEFAULT_SPEED_KMH = 25;

export async function calculateETAForRoute(
  routeId: string,
  currentLat: number,
  currentLon: number,
  speedKmh?: number | null
): Promise<ETAResult[]> {
  const { data: stops, error } = await supabase
    .from('stops')
    .select('id, name, latitude, longitude, sequence_number')
    .eq('route_id', routeId)
    .order('sequence_number', { ascending: true });

  if (error || !stops || stops.length === 0) return [];

  const speed = speedKmh && speedKmh > 2 ? speedKmh : DEFAULT_SPEED_KMH;

  // Encontra a próxima parada (mais próxima que ainda não passou)
  let closestIdx = 0;
  let minDist = Infinity;
  stops.forEach((stop, i) => {
    if (!stop.latitude || !stop.longitude) return;
    const d = haversineKm(currentLat, currentLon, stop.latitude, stop.longitude);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  });

  // Calcula ETA cumulativo a partir da parada mais próxima
  const results: ETAResult[] = [];
  let cumulativeKm = minDist; // distância do autocarro até a próxima paragem

  for (let i = closestIdx; i < stops.length; i++) {
    const stop = stops[i];
    if (!stop.latitude || !stop.longitude) continue;

    if (i > closestIdx) {
      const prev = stops[i - 1];
      if (prev.latitude && prev.longitude) {
        cumulativeKm += haversineKm(prev.latitude, prev.longitude, stop.latitude, stop.longitude);
      }
    }

    const etaMinutes = Math.round((cumulativeKm / speed) * 60);
    results.push({
      stopId: stop.id,
      stopName: stop.name,
      etaMinutes,
      distanceKm: parseFloat(cumulativeKm.toFixed(2)),
    });
  }

  return results;
}

export async function calculateNextStopETA(
  routeId: string,
  currentLat: number,
  currentLon: number,
  speedKmh?: number | null
): Promise<{ stopName: string; etaMinutes: number } | null> {
  const etas = await calculateETAForRoute(routeId, currentLat, currentLon, speedKmh);
  if (etas.length === 0) return null;
  return { stopName: etas[0].stopName, etaMinutes: etas[0].etaMinutes };
}

// Actualiza o ETA no veículo (campo estimatedTimeToNextStop é gerido via BusData)
export async function updateVehicleETA(
  vehicleId: string,
  etaMinutes: number,
  nextStopName: string
): Promise<void> {
  await supabase
    .from('vehicles')
    .update({
      estimated_eta_minutes: etaMinutes,
      next_stop_name: nextStopName,
      last_location_update: new Date().toISOString(),
    })
    .eq('id', vehicleId);
}
