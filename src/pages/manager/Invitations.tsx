
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key } from 'lucide-react';
import { Invitation } from '@/types';

import QuickDriverDialog from '@/components/manager/QuickDriverDialog';
import InvitationFormDialog from '@/components/manager/InvitationFormDialog';
import InvitationsTable from '@/components/manager/InvitationsTable';

const Invitations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickDriverDialogOpen, setIsQuickDriverDialogOpen] = useState(false);

  // Carregar convites existentes
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data as Invitation[]);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      toast.error('Não foi possível carregar os convites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Verificar se o usuário é um gestor
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'manager') {
        toast.error('Acesso restrito a gestores');
        navigate('/');
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleInvitationCreated = (newInvitation: Invitation) => {
    setInvitations(prev => [newInvitation, ...prev]);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const closeQuickDriverDialog = () => {
    setIsQuickDriverDialogOpen(false);
  };

  return (
    <Layout title="Gestão de Convites">
      <div className="container mx-auto py-6">
        <div className="flex justify-between flex-wrap gap-2 items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Convites</h1>
          <div className="flex gap-2">
            <Dialog open={isQuickDriverDialogOpen} onOpenChange={setIsQuickDriverDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Key size={18} />
                  Gerar Código para Motorista
                </Button>
              </DialogTrigger>
              <QuickDriverDialog 
                closeDialog={closeQuickDriverDialog} 
                onInvitationCreated={handleInvitationCreated}
              />
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Criar Novo Convite</Button>
              </DialogTrigger>
              <InvitationFormDialog 
                closeDialog={closeDialog} 
                onInvitationCreated={handleInvitationCreated}
              />
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Convites</CardTitle>
            <CardDescription>
              Lista de todos os convites gerados para novos usuários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsTable invitations={invitations} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invitations;
