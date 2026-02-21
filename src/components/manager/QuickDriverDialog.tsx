
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Key, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuickDriverDialogProps {
  closeDialog: () => void;
  onInvitationCreated: (invitation: any) => void;
}

const QuickDriverDialog: React.FC<QuickDriverDialogProps> = ({
  closeDialog,
  onInvitationCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [driverCode, setDriverCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Gerar código de ativação
  const generateActivationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createDriverInvitation = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }
      
      const activationCode = generateActivationCode();
      
      // Criar novo convite de motorista
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          role: 'driver',
          activation_code: activationCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de validade
          used: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Exibir código gerado
      setDriverCode(activationCode);
      onInvitationCreated(data);
      toast.success('Código para motorista criado com sucesso!');
      
      return activationCode;
    } catch (error) {
      console.error('Erro ao criar código de motorista:', error);
      toast.error('Erro ao criar código de motorista');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success('Código copiado para a área de transferência');
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      {!driverCode ? (
        <>
          <DialogHeader>
            <DialogTitle>Criar Código para Motorista</DialogTitle>
            <DialogDescription>
              Clique no botão abaixo para gerar um código de convite para motoristas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button 
              onClick={async () => await createDriverInvitation()}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Gerando..." : "Gerar Código para Motorista"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>Código de Motorista Gerado</DialogTitle>
            <DialogDescription>
              Compartilhe este código com o motorista para que ele possa se registrar no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Código de Ativação:</h4>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold tracking-wider">{driverCode}</div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(driverCode)}>
                  {codeCopied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                O código é válido por 7 dias e pode ser usado apenas uma vez.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog}>Fechar</Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
};

export default QuickDriverDialog;
