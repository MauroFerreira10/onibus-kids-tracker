import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StopArrival {
  id: string;
  stop_id: string;
  vehicle_id: string;
  arrival_time: string;
  status: 'arrived' | 'departed';
  created_at: string;
}

export const stopService = {
  // Registrar chegada do ônibus em uma parada
  async registerArrival(stopId: string, vehicleId: string): Promise<void> {
    try {
      console.log('Registrando chegada na parada:', stopId, 'para o veículo:', vehicleId);
      
      // Primeiro, vamos verificar se a parada existe
      const { data: stopData, error: stopError } = await supabase
        .from('stops')
        .select('id, name, route_id')
        .eq('id', stopId)
        .single();

      if (stopError || !stopData) {
        console.error('Erro ao verificar parada:', stopError);
        throw new Error('Parada não encontrada');
      }

      console.log('Parada encontrada:', stopData.name);

      // Busca informações do veículo
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('plate')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) {
        console.error('Erro ao buscar informações do veículo:', vehicleError);
      }

      // Agora registra a chegada
      const { data, error } = await supabase
        .from('stop_arrivals')
        .insert({
          stop_id: stopId,
          vehicle_id: vehicleId,
          route_id: stopData.route_id,
          status: 'arrived',
          arrival_time: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas a partir de agora
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar chegada:', error);
        throw error;
      }

      console.log('Chegada registrada com sucesso:', data);

      // Envia uma notificação manual para garantir
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'arrival',
          message: `Ônibus ${vehicleData?.plate || ''} chegou na parada ${stopData.name}`,
          stop_id: stopId,
          vehicle_id: vehicleId,
          route_id: stopData.route_id,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
      } else {
        console.log('Notificação criada com sucesso');
      }

    } catch (error) {
      console.error('Erro ao registrar chegada:', error);
      toast.error('Erro ao registrar chegada na parada');
      throw error;
    }
  },

  // Registrar saída do ônibus de uma parada
  async registerDeparture(stopId: string, vehicleId: string): Promise<void> {
    try {
      // Primeiro, vamos verificar se a parada existe
      const { data: stopData, error: stopError } = await supabase
        .from('stops')
        .select('id, name, route_id')
        .eq('id', stopId)
        .single();

      if (stopError || !stopData) {
        console.error('Erro ao verificar parada:', stopError);
        throw new Error('Parada não encontrada');
      }

      // Busca informações do veículo
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('plate')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) {
        console.error('Erro ao buscar informações do veículo:', vehicleError);
      }

      // Registra a saída
      const { data, error } = await supabase
        .from('stop_arrivals')
        .insert({
          stop_id: stopId,
          vehicle_id: vehicleId,
          route_id: stopData.route_id,
          status: 'departed',
          arrival_time: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas a partir de agora
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar saída:', error);
        throw error;
      }

      // Envia uma notificação de saída
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'departure',
          message: `Ônibus ${vehicleData?.plate || ''} saiu da parada ${stopData.name}`,
          stop_id: stopId,
          vehicle_id: vehicleId,
          route_id: stopData.route_id,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Erro ao criar notificação de saída:', notificationError);
      } else {
        console.log('Notificação de saída criada com sucesso');
      }

    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      toast.error('Erro ao registrar saída da parada');
      throw error;
    }
  },

  // Buscar últimas chegadas de um ônibus específico
  async getVehicleArrivals(vehicleId: string): Promise<StopArrival[]> {
    try {
      const { data, error } = await supabase
        .from('stop_arrivals')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('arrival_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar chegadas:', error);
      toast.error('Erro ao buscar histórico de chegadas');
      return [];
    }
  },

  // Buscar últimas chegadas em uma parada específica
  async getStopArrivals(stopId: string): Promise<StopArrival[]> {
    try {
      const { data, error } = await supabase
        .from('stop_arrivals')
        .select('*')
        .eq('stop_id', stopId)
        .order('arrival_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar chegadas:', error);
      toast.error('Erro ao buscar histórico de chegadas');
      return [];
    }
  },

  // Inscrever-se para receber notificações de chegadas
  subscribeToArrivals(callback: (payload: any) => void) {
    const channel = supabase.channel('bus_arrivals');
    
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stop_arrivals'
      }, (payload) => {
        console.log('Evento de chegada recebido:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('Status da inscrição de chegadas:', status);
      });

    return channel;
  }
}; 