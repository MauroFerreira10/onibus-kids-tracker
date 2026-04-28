import { supabase } from '@/integrations/supabase/client';

// Minutos de antecedência para disparar email
const EMAIL_ALERT_THRESHOLD_MINUTES = 5;

// Memória de sessão para não disparar email repetido na mesma sessão
const emailAlertsSent = new Set<string>();

async function triggerArrivalEmailAlert(
  stopId: string,
  stopName: string,
  routeId: string,
  vehicleId: string,
  etaMinutes: number
): Promise<void> {
  const key = `${stopId}_${vehicleId}_${new Date().toDateString()}`;
  if (emailAlertsSent.has(key)) return;

  emailAlertsSent.add(key);

  try {
    const { error } = await supabase.functions.invoke('send-arrival-email', {
      body: { stopId, stopName, routeId, vehicleId, etaMinutes },
    });
    if (error) {
      console.error('Erro ao invocar send-arrival-email:', error);
      emailAlertsSent.delete(key); // permite nova tentativa
    } else {
      console.log(`Email de chegada enviado para paragem "${stopName}" (ETA: ${etaMinutes} min)`);
    }
  } catch (err) {
    console.error('Falha ao disparar alerta de email:', err);
    emailAlertsSent.delete(key);
  }
}

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
  speedKmh?: number | null,
  vehicleId?: string
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

    // Dispara email quando autocarro está a <= 5 minutos da paragem
    if (
      vehicleId &&
      etaMinutes <= EMAIL_ALERT_THRESHOLD_MINUTES &&
      etaMinutes > 0
    ) {
      triggerArrivalEmailAlert(stop.id, stop.name, routeId, vehicleId, etaMinutes);
    }
  }

  return results;
}

export async function calculateNextStopETA(
  routeId: string,
  currentLat: number,
  currentLon: number,
  speedKmh?: number | null,
  vehicleId?: string
): Promise<{ stopName: string; etaMinutes: number } | null> {
  const etas = await calculateETAForRoute(routeId, currentLat, currentLon, speedKmh, vehicleId);
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
