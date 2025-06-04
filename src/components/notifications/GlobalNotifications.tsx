import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const GlobalNotifications: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('Usuário não está autenticado');
      return;
    }

    // Busca a parada do aluno diretamente na tabela students
    const fetchStudentStop = async () => {
      console.log('Buscando parada do aluno para o usuário:', user.id);
      
      // Primeiro verifica se o usuário é um aluno
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData || profileData.role !== 'student') {
        console.log('Usuário não é um aluno:', profileData?.role);
        return;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, stop_id')
        .eq('id', user.id)
        .single();

      if (studentError || !studentData || !studentData.stop_id) {
        console.log('Erro ao buscar parada do aluno:', studentError);
        return;
      }

      console.log('Parada do aluno encontrada:', studentData.stop_id);

      // Canal para notificações de chegada em tempo real
      const realtimeChannel = supabase.channel(`student_realtime_${user.id}`, {
        config: {
          broadcast: { self: true }
        }
      });
      
      realtimeChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'stop_arrivals',
            filter: `stop_id=eq.${studentData.stop_id}`
          },
          async (payload) => {
            console.log('Notificação de chegada recebida:', payload);
            
            // Busca informações da parada para mostrar na notificação
            const { data: stopData } = await supabase
              .from('stops')
              .select('name')
              .eq('id', studentData.stop_id)
              .single();

            // Busca informações do veículo
            const { data: vehicleData } = await supabase
              .from('vehicles')
              .select('plate')
              .eq('id', payload.new.vehicle_id)
              .single();

            // Busca informações da rota
            const { data: routeData } = await supabase
              .from('routes')
              .select('name')
              .eq('id', payload.new.route_id)
              .single();

            const isArrival = payload.new.status === 'arrived';
            showNotification(
              stopData?.name || 'sua parada',
              vehicleData?.plate || '',
              routeData?.name || '',
              isArrival
            );
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em tempo real:', status);
        });

      // Inscreve também no canal de notificações do banco de dados
      const notificationChannel = supabase.channel(`notifications_${user.id}`, {
        config: {
          broadcast: { self: true }
        }
      });

      notificationChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notificação recebida:', payload);
            if (payload.new.type === 'arrival' || payload.new.type === 'departure') {
              showNotification(
                payload.new.stop_name || 'sua parada',
                payload.new.vehicle_plate || '',
                payload.new.route_name || '',
                payload.new.type === 'arrival'
              );
            }
          }
        )
        .subscribe();

      return () => {
        console.log('Desinscrevendo dos canais de notificações em tempo real');
        realtimeChannel.unsubscribe();
        notificationChannel.unsubscribe();
      };
    };

    const showNotification = (stopName: string, vehiclePlate: string, routeName: string, isArrival: boolean) => {
      console.log('Tentando mostrar notificação para parada:', stopName, 'e veículo:', vehiclePlate);
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-in slide-in-from-right">
          <div className={`p-2 rounded-full ${isArrival ? 'bg-busapp-primary/10' : 'bg-blue-100'}`}>
            {isArrival ? (
              <Bell className="h-5 w-5 text-busapp-primary" />
            ) : (
              <MapPin className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{isArrival ? 'Ônibus chegou!' : 'Ônibus saiu!'}</p>
            <p className="text-sm text-gray-500">
              O ônibus {vehiclePlate ? `(${vehiclePlate})` : ''} da rota {routeName ? `"${routeName}"` : ''} {isArrival ? 'chegou' : 'saiu'} na parada {stopName}
            </p>
          </div>
        </div>
      ), {
        duration: 10000, // 10 segundos
        position: 'top-right'
      });
    };

    fetchStudentStop();
  }, [user]);

  return null;
}; 