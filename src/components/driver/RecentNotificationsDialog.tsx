import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
}

export function RecentNotificationsDialog() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-busapp-primary/20 text-busapp-primary hover:bg-busapp-primary/5"
        >
          <Bell className="mr-2 h-5 w-5" />
          Notificações Recentes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificações Recentes</DialogTitle>
          <DialogDescription>
            Visualize as notificações mais recentes do sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Carregando notificações...</div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma notificação encontrada</p>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${
                  notification.read ? 'bg-muted/50' : 'bg-white'
                }`}
              >
                <div className="text-sm">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 