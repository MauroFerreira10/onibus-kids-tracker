import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export const logActivity = async (action: string, details?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_name: profile?.full_name || 'Usuário',
        action,
        details
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    toast.error('Erro ao registrar atividade');
  }
};

export const getRecentActivities = async (limit: number = 5): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    toast.error('Erro ao carregar atividades recentes');
    return [];
  }
}; 