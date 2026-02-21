
import React from 'react';
import { Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Invitation } from '@/types';

interface InvitationsTableProps {
  invitations: Invitation[];
  loading: boolean;
}

const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations,
  loading
}) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência');
  };

  return (
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
                      copyToClipboard(url);
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
  );
};

export default InvitationsTable;
