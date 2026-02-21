import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Bell, BellRing, Bus, Clock, Send, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
        .gt('expires_at', new Date().toISOString()) // Only get non-expired notifications
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

      // Calculate expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const notification = {
        type: 'system',
        message: newMessage.trim(),
        time: new Date().toISOString(),
        read: false,
        icon: 'alert',
        user_id: user.id,
        sender_role: getUserRole(),
        expires_at: expiresAt.toISOString()
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
        return <Bus className="h-5 w-5 text-blue-600" />;
      case 'clock':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'user':
        return <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'delay':
        return 'bg-amber-50 border-amber-200';
      case 'arrival':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Header - design profissional */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <BellRing className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Notificações</h1>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1"
                  >
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      {unreadCount} não lidas
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('all')}
                className={`${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('unread')}
                className={`${
                  filter === 'unread' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Não lidas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('read')}
                className={`${
                  filter === 'read' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Lidas
              </Button>
            </div>
          </motion.div>

          {/* Notifications list */}
          <AnimatePresence mode="wait">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`${
                      getNotificationStyle(notification.type)
                    } ${
                      !notification.read 
                        ? 'border-l-4 border-l-blue-500 shadow-sm' 
                        : 'shadow-sm'
                    } bg-white border border-gray-200 hover:shadow-md transition-shadow rounded-xl`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getIcon(notification.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">{notification.message}</p>
                            <span className="text-sm text-gray-500">
                              {formatNotificationTime(notification.time)}
                            </span>
                          </div>
                          {notification.sender_role && (
                            <p className="text-sm text-gray-500 mt-1">
                              Enviado por: {notification.sender_role === 'driver' ? 'Motorista' : 'Gestor'}
                            </p>
                          )}
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredNotifications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
                >
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Nenhuma notificação encontrada
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dialog for sending a new notification */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="bg-white border border-gray-200 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Enviar Notificação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={sendNotification}
              disabled={isSending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Notifications;
