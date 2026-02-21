import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const GlobalNotifications: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('Usuário não está autenticado');
      return;
    }

    console.log('Iniciando inscrição para notificações em tempo real');

    // Canal para notificações em tempo real
    const notificationChannel = supabase.channel(`notifications_${user.id}`, {
      config: {
        broadcast: { self: true }
      }
    });

    // Canal para mensagens em tempo real
    const messagesChannel = supabase.channel(`messages_${user.id}`, {
      config: {
        broadcast: { self: true }
      }
    });

    // Inscrever-se para notificações
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
          console.log('Nova notificação recebida:', payload);
          const notification = payload.new;

          // Mostrar toast para notificações de chat
          if (notification.type === 'chat') {
            toast(
              <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-in slide-in-from-right">
                <div className="p-2 rounded-full bg-green-100">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Nova mensagem</p>
                  <p className="text-sm text-gray-500">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.time).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>,
              {
                duration: 10000,
                position: 'top-right'
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição em notificações:', status);
      });

    // Inscrever-se para mensagens em tempo real
    messagesChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=neq.${user.id}`
        },
        async (payload) => {
          console.log('Nova mensagem recebida:', payload);
          const message = payload.new;

          // Se a mensagem não for do usuário atual, mostrar toast
          if (message.sender_id !== user.id) {
            toast(
              <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-in slide-in-from-right">
                <div className="p-2 rounded-full bg-green-100">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Nova mensagem</p>
                  <p className="text-sm text-gray-500">
                    {`${message.sender_name}: ${message.content}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>,
              {
                duration: 10000,
                position: 'top-right'
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição em mensagens:', status);
      });

    return () => {
      console.log('Desinscrevendo dos canais');
      notificationChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [user]);

  return null;
}; 