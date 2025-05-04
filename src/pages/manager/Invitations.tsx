
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, CheckCircle, Key } from 'lucide-react';
import { Invitation } from '@/types';

const invitationSchema = z.object({
  role: z.enum(['parent', 'student', 'driver', 'manager']),
  email: z.string().email("Email inválido").optional(),
  childName: z.string().optional(),
  studentNumber: z.string().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

const Invitations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickDriverDialogOpen, setIsQuickDriverDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [driverCode, setDriverCode] = useState<string | null>(null);

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
      setInvitations(prev => [data as Invitation, ...prev]);
      
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

  const createDriverInvitation = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }
      
      const activationCode = generateActivationCode();
      const baseUrl = window.location.origin;
      
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
      
      // Atualizar lista de convites
      setInvitations(prev => [data as Invitation, ...prev]);
      
      // Exibir código gerado
      setDriverCode(activationCode);
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

  const closeDialog = () => {
    setIsDialogOpen(false);
    setGeneratedCode(null);
    setShareUrl(null);
    setUrlCopied(false);
    setCodeCopied(false);
  };

  const closeQuickDriverDialog = () => {
    setIsQuickDriverDialogOpen(false);
    setDriverCode(null);
    setCodeCopied(false);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'parent': return 'Responsável';
      case 'student': return 'Aluno';
      case 'driver': return 'Motorista';
      case 'manager': return 'Gestor';
      default: return role;
    }
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
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(driverCode, 'code')}>
                            {codeCopied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          O código é válido por 7 dias e pode ser usado apenas uma vez.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={closeQuickDriverDialog}>Fechar</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Criar Novo Convite</Button>
              </DialogTrigger>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Nenhum convite encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.activation_code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            invitation.role === 'driver' ? 'default' :
                            invitation.role === 'parent' ? 'secondary' :
                            invitation.role === 'manager' ? 'destructive' : 
                            'outline'
                          }>
                            {getRoleName(invitation.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>{invitation.email || '-'}</TableCell>
                        <TableCell>{formatDate(invitation.created_at)}</TableCell>
                        <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                        <TableCell>
                          <Badge variant={invitation.used ? 'outline' : 'success'}>
                            {invitation.used ? 'Usado' : 'Ativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={invitation.used}
                            onClick={() => {
                              const baseUrl = window.location.origin;
                              const url = `${baseUrl}/auth/register?role=${invitation.role}&code=${invitation.activation_code}`;
                              copyToClipboard(url, 'url');
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Compartilhar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invitations;
