import { supabase } from '@/integrations/supabase/client';
import { StopData } from '@/types';

/**
 * Verifica se o motorista está no horário para uma parada específica
 */
export const checkStopOnTime = async (stopId: string, scheduledTime: string): Promise<boolean> => {
  try {
    // Converter horário agendado para formato TIME
    const [hours, minutes] = scheduledTime.split(':');
    const scheduledTimeObj = `${hours}:${minutes}:00`;
    
    const { data, error } = await supabase.rpc('check_driver_on_time', {
      p_stop_id: stopId,
      p_scheduled_time: scheduledTimeObj
    });
    
    if (error) {
      console.error('Erro ao verificar horário:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Erro ao verificar status de horário:', error);
    return false;
  }
};

/**
 * Busca paradas com verificação de status de horário
 */
export const fetchStopsWithStatus = async (routeId?: string): Promise<StopData[]> => {
  try {
    let query = supabase
      .from('stops')
      .select('*')
      .order('sequence_number', { ascending: true });
    
    if (routeId) {
      query = query.eq('route_id', routeId);
    }
    
    const { data: stopsData, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Buscar horários agendados das paradas
    const stopsWithStatus = await Promise.all(
      (stopsData || []).map(async (stop) => {
        // Buscar horário agendado da parada
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('arrival_time')
          .eq('stop_id', stop.id)
          .limit(1)
          .maybeSingle();
        
        const scheduledTime = scheduleData?.arrival_time 
          ? scheduleData.arrival_time.substring(0, 5) // HH:MM
          : getDefaultScheduledTime(stop.name);
        
        // Verificar se está no horário
        const isOnTime = await checkStopOnTime(stop.id, scheduledTime);
        
        return {
          id: stop.id,
          name: stop.name,
          address: stop.address,
          latitude: stop.latitude || 0,
          longitude: stop.longitude || 0,
          scheduledTime,
          estimatedTime: isOnTime ? scheduledTime : calculateDelayedTime(scheduledTime),
        };
      })
    );
    
    return stopsWithStatus;
  } catch (error) {
    console.error('Erro ao buscar paradas:', error);
    return [];
  }
};

/**
 * Função auxiliar para obter horário padrão baseado no nome da parada
 */
const getDefaultScheduledTime = (stopName: string): string => {
  const name = stopName.toLowerCase();
  if (name.includes('reitoria') || name.includes('mandume')) {
    return '07:30';
  } else if (name.includes('tchioco')) {
    return '07:50';
  }
  return '07:40';
};

/**
 * Calcula horário estimado com atraso (adiciona 5-15 minutos)
 */
const calculateDelayedTime = (scheduledTime: string): string => {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const delayedMinutes = minutes + 5 + Math.floor(Math.random() * 10); // 5-15 minutos de atraso
  const newHours = hours + Math.floor(delayedMinutes / 60);
  const newMinutes = delayedMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

