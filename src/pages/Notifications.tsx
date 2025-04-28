
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Bell, BellRing, Bus, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data para notificações
const mockNotifications = [
  {
    id: '1',
    type: 'arrival',
    message: 'Ônibus está a 5 minutos do seu ponto.',
    time: '2025-04-28T07:25:00',
    read: false,
    icon: 'bus'
  },
  {
    id: '2',
    type: 'delay',
    message: 'Transporte atrasado em 10 minutos por trânsito.',
    time: '2025-04-28T07:10:00',
    read: false,
    icon: 'clock'
  },
  {
    id: '3',
    type: 'driver',
    message: 'Mudança de motorista registrada hoje.',
    time: '2025-04-27T18:30:00',
    read: true,
    icon: 'user'
  },
  {
    id: '4',
    type: 'system',
    message: 'Atualização do aplicativo disponível.',
    time: '2025-04-26T14:15:00',
    read: true,
    icon: 'alert'
  },
  {
    id: '5',
    type: 'arrival',
    message: 'O ônibus chegou ao ponto de embarque.',
    time: '2025-04-26T07:30:00',
    read: true,
    icon: 'bus'
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  
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

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
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
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
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
          {filteredNotifications.length === 0 ? (
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
    </Layout>
  );
};

export default Notifications;
