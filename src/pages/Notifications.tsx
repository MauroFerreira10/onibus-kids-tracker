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
    const baseClasses = 'h-5 w-5';
    switch (iconType) {
      case 'bus':
        return <Bus className={`${baseClasses} text-safebus-blue`} />;
      case 'clock':
        return <Clock className={`${baseClasses} text-orange-600`} />;
      case 'alert':
        return <AlertCircle className={`${baseClasses} text-red-600`} />;
      case 'message':
        return <MessageSquare className={`${baseClasses} text-emerald-600`} />;
      default:
        return <Bell className={`${baseClasses} text-safebus-blue`} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'delay': return 'bg-orange-100';
      case 'arrival': return 'bg-safebus-blue/10';
      case 'alert': return 'bg-red-100';
      default: return 'bg-safebus-yellow/15';
    }
  };

  const getAccentBar = (type: string) => {
    switch (type) {
      case 'delay': return 'bg-orange-500';
      case 'arrival': return 'bg-safebus-blue';
      case 'alert': return 'bg-red-500';
      default: return 'bg-safebus-yellow';
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 space-y-6"
        >
          {/* Hero Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-safebus-blue via-safebus-blue to-safebus-blue-dark rounded-2xl shadow-xl"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FBBF24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-safebus-yellow/10 rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-14 h-14 bg-safebus-yellow rounded-2xl shadow-lg flex-shrink-0">
                  <BellRing className="h-8 w-8 text-safebus-blue" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 border-2 border-safebus-blue"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Notificações</h1>
                  <p className="text-safebus-yellow font-semibold text-sm mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}` : 'Tudo em dia'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={markAllAsRead}
                  className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-semibold border-0"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            {/* Filter pills */}
            <div className="relative z-10 px-6 pb-5 flex gap-2">
              {[
                { id: 'all', label: 'Todas', count: notifications.length },
                { id: 'unread', label: 'Não lidas', count: unreadCount },
                { id: 'read', label: 'Lidas', count: notifications.length - unreadCount },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === f.id
                      ? 'bg-safebus-yellow text-safebus-blue shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {f.label}
                  <span className={`px-1.5 rounded-full text-[10px] ${filter === f.id ? 'bg-safebus-blue text-safebus-yellow' : 'bg-white/20'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.header>

          {/* Notifications list */}
          <AnimatePresence mode="popLayout">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group flex overflow-hidden rounded-xl border transition-all hover:shadow-md ${
                    !notification.read
                      ? 'bg-white border-safebus-blue/20 shadow-sm'
                      : 'bg-white/60 border-gray-100'
                  }`}
                >
                  <div className={`w-1.5 flex-shrink-0 ${getAccentBar(notification.type)}`} />
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getIconBg(notification.type)}`}>
                        {getIcon(notification.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className={`font-semibold ${!notification.read ? 'text-safebus-blue' : 'text-gray-600'} text-sm`}>
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                            {formatNotificationTime(notification.time)}
                          </span>
                        </div>
                        {notification.sender_role && (
                          <p className="text-xs text-gray-400 mt-1">
                            Por: <span className="font-medium text-safebus-blue/70">{notification.sender_role === 'driver' ? 'Motorista' : 'Gestor'}</span>
                          </p>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 text-xs font-semibold text-safebus-blue hover:text-safebus-blue-dark underline-offset-2 hover:underline"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-safebus-yellow rounded-full flex-shrink-0 mt-2" aria-label="Não lida" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredNotifications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-2xl shadow-sm border border-safebus-blue/10"
                >
                  <div className="w-16 h-16 bg-safebus-blue/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-8 w-8 text-safebus-blue/30" />
                  </div>
                  <p className="text-gray-400 font-medium">Nenhuma notificação encontrada</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Floating send button (drivers/managers) */}
          {canSendNotifications() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed bottom-24 right-6 z-30"
            >
              <Button
                onClick={() => setShowSendDialog(true)}
                className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold shadow-2xl rounded-full h-14 w-14 p-0 border-2 border-white"
                aria-label="Enviar notificação"
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="bg-white border border-safebus-blue/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-safebus-blue flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificação
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite a mensagem..."
            className="bg-white border-gray-200 focus:border-safebus-blue focus:ring-safebus-blue min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendDialog(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={sendNotification}
              disabled={isSending || !newMessage.trim()}
              className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0"
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
