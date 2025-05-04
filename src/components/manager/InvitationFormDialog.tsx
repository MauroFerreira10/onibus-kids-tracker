
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Share2, Copy, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface InvitationFormDialogProps {
  closeDialog: () => void;
  onInvitationCreated: (invitation: any) => void;
}

const invitationSchema = z.object({
  role: z.enum(['parent', 'student', 'driver', 'manager']),
  email: z.string().email("Email inválido").optional(),
  childName: z.string().optional(),
  studentNumber: z.string().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

const InvitationFormDialog: React.FC<InvitationFormDialogProps> = ({
  closeDialog,
  onInvitationCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      role: 'driver',
      email: '',
      childName: '',
      studentNumber: '',
    },
  });

  const watchRole = form.watch("role");

  // Gerar código de ativação
  const generateActivationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const onSubmit = async (values: InvitationFormValues) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }
      
      const activationCode = generateActivationCode();
      const baseUrl = window.location.origin;
      
      // Criar novo convite
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          role: values.role,
          email: values.email || null,
          child_name: values.childName || null,
          student_number: values.studentNumber || null,
          activation_code: activationCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de validade
          used: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista de convites
      onInvitationCreated(data);
      
      // Gerar URL para compartilhamento
      const shareUrl = `${baseUrl}/auth/register?role=${values.role}&code=${activationCode}`;
      
      setGeneratedCode(activationCode);
      setShareUrl(shareUrl);
      toast.success('Convite criado com sucesso!');
      
      // Resetar formulário mas deixar diálogo aberto para mostrar o código
      form.reset({
        role: 'driver', // Valor padrão para motoristas
        email: '',
        childName: '',
        studentNumber: '',
      });
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } else {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
    toast.success(`${type === 'url' ? 'Link' : 'Código'} copiado para a área de transferência`);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      {generatedCode ? (
        <>
          <DialogHeader>
            <DialogTitle>Convite Criado</DialogTitle>
            <DialogDescription>
              Compartilhe o código ou o link abaixo com o usuário convidado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Código de Ativação:</h4>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="text-xl font-bold tracking-wider">{generatedCode}</div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedCode, 'code')}>
                  {codeCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Link de Convite:</h4>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md overflow-x-auto">
                <div className="text-sm text-muted-foreground">{shareUrl}</div>
                <Button variant="ghost" size="sm" onClick={() => shareUrl && copyToClipboard(shareUrl, 'url')}>
                  {urlCopied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog}>Fechar</Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Preencha os dados para gerar um código de convite.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de usuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="driver">Motorista</SelectItem>
                        <SelectItem value="parent">Responsável</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRole === 'parent' && (
                <>
                  <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Criança</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo da criança" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Estudante</FormLabel>
                        <FormControl>
                          <Input placeholder="Número do estudante" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Gerando..." : "Gerar Código"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </>
      )}
    </DialogContent>
  );
};

export default InvitationFormDialog;
