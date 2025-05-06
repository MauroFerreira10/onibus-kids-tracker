
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Bell, BellRing, Bus, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  // Load user notifications
  useEffect(() => {
    fetchNotifications();
  }, [user]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try to fetch real notifications using our new notifications table
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (notificationError) {
        console.error('Erro ao buscar notificações:', notificationError);
        
        // Fallback to locations data as sample
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('driver_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);
            
        if (error) {
          console.error('Erro ao buscar dados de localização:', error);
          return;
        }
        
        if (data) {
          // Convert the locations data to notifications format
          const formattedData: Notification[] = data.map((item, index) => ({
            id: item.id,
            type: index % 3 === 0 ? 'arrival' : index % 2 === 0 ? 'delay' : 'system',
            message: `Atualização de localização em ${new Date(item.timestamp).toLocaleTimeString('pt-BR')}`,
            time: item.timestamp,
            read: false,
            icon: index % 3 === 0 ? 'bus' : index % 2 === 0 ? 'clock' : 'alert',
            user_id: item.driver_id
          }));
          
          setNotifications(formattedData);
        }
      } else {
        // Use real notifications if available (convert to our frontend format)
        const typedNotifications: Notification[] = notificationData?.map(n => ({
          id: n.id,
          type: n.type as any,
          message: n.message,
          time: n.time,
          read: n.read,
          icon: n.icon,
          user_id: n.user_id,
          sender_role: n.sender_role,
          created_at: n.created_at
        })) || [];
        
        setNotifications(typedNotifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendNotification = async () => {
    if (!user || !newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      const notification = {
        type: 'system',
        message: newMessage.trim(),
        time: new Date().toISOString(),
        read: false,
        icon: 'alert',
        user_id: user.id,
        sender_role: getUserRole()
      };
      
      // Insert into notifications table
      const { error } = await supabase
        .from('notifications')
        .insert(notification);
      
      if (error) {
        console.error('Erro ao enviar notificação:', error);
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso!",
        variant: "default"
      });
      
      setShowSendDialog(false);
      setNewMessage('');
      fetchNotifications(); // Refresh the list
      
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const getUserRole = () => {
    // This is a placeholder - in a real app, you would get this from the user's profile
    // or from a context that holds the user's role
    return 'driver'; // or 'manager'
  };
  
  const canSendNotifications = () => {
    const role = getUserRole();
    return role === 'driver' || role === 'manager';
  };
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      case 'user':
        return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Verificar se é hoje
    if (date.toDateString() === now.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Verificar se é ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Caso contrário, mostrar data completa
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Update real notifications if possible
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
      }
      
      // Update local state anyway
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      // Update real notifications if possible
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
      
      // Update local state anyway
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-busapp-primary" />
            <h2 className="text-2xl font-bold">Notificações</h2>
            {unreadCount > 0 && (
              <Badge className="bg-busapp-primary ml-2">{unreadCount} não lidas</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
            {canSendNotifications() && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowSendDialog(true)}
              >
                <Send className="h-4 w-4 mr-1" />
                Enviar notificação
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('unread')}
            disabled={!unreadCount}
          >
            Não lidas
          </Button>
          <Button 
            variant={filter === 'read' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('read')}
          >
            Lidas
          </Button>
        </div>

        {/* Notifications list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busapp-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-500">
                Nenhuma notificação {filter !== 'all' ? (filter === 'unread' ? 'não lida' : 'lida') : ''}
              </h3>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`
                  border-l-4 transition-all
                  ${notification.read ? 'border-l-gray-200' : 'border-l-busapp-primary shadow-md'}
                  ${notification.type === 'delay' ? 'border-l-yellow-400' : ''}
                  ${notification.type === 'arrival' ? 'border-l-green-400' : ''}
                `}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`
                    p-2 rounded-full flex-shrink-0
                    ${notification.read ? 'bg-gray-100 text-gray-500' : 'bg-busapp-primary/10 text-busapp-primary'}
                    ${notification.type === 'delay' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${notification.type === 'arrival' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {getIcon(notification.icon)}
                  </div>
                  
                  <div className="flex-grow">
                    <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-black'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNotificationTime(notification.time)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Dialog for sending a new notification */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar nova notificação</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Escreva a mensagem da notificação aqui..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSendDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={sendNotification} 
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Notifications;
