import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Route, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface RouteRecord {
  id: string;
  name: string;
  description: string | null;
  start_location: string | null;
  end_location: string | null;
  school_id: string | null;
  status: string;
  vehicle_id: string | null;
  driver_id: string | null;
  total_stops: number;
}

const SchoolRoutes = () => {
  const { profile } = useAuth();
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RouteRecord | null>(null);
  const [form, setForm] = useState({ name: '', description: '', start_location: '', end_location: '', status: 'active' });

  const loadRoutes = async () => {
    if (!profile?.school_id) return;
    try {
      const { data } = await supabase.from('routes').select('*').eq('school_id', profile.school_id).order('name');
      setRoutes(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRoutes(); }, [profile?.school_id]);

  const resetForm = () => {
    setForm({ name: '', description: '', start_location: '', end_location: '', status: 'active' });
    setEditing(null);
  };

  const handleSave = async () => {
    if (!profile?.school_id || !form.name.trim()) { toast.error('Nome da rota é obrigatório'); return; }
    try {
      const payload = { ...form, school_id: profile.school_id, description: form.description || null, start_location: form.start_location || null, end_location: form.end_location || null };
      if (editing) {
        await supabase.from('routes').update(payload).eq('id', editing.id);
        toast.success('Rota actualizada');
      } else {
        await supabase.from('routes').insert(payload);
        toast.success('Rota criada');
      }
      setDialogOpen(false);
      resetForm();
      loadRoutes();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleEdit = (r: RouteRecord) => {
    setEditing(r);
    setForm({ name: r.name, description: r.description || '', start_location: r.start_location || '', end_location: r.end_location || '', status: r.status });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza?')) return;
    try {
      await supabase.from('routes').delete().eq('id', id);
      toast.success('Rota removida');
      loadRoutes();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-safebus-blue">Rotas</h1><p className="text-sm text-gray-500">Gerir rotas da escola</p></div>
          <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0"><Plus className="h-4 w-4 mr-2" />Nova Rota</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Editar Rota' : 'Nova Rota'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Rota A - Bairro Central" /></div>
                <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição opcional" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Partida</Label><Input value={form.start_location} onChange={e => setForm(f => ({ ...f, start_location: e.target.value }))} placeholder="Ex: Escola" /></div>
                  <div><Label>Chegada</Label><Input value={form.end_location} onChange={e => setForm(f => ({ ...f, end_location: e.target.value }))} placeholder="Ex: Bairro Central" /></div>
                </div>
                <div><Label>Estado</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full bg-safebus-yellow hover:bg-safebus-yellow-dark text-safebus-blue font-bold border-0">
                  {editing ? 'Guardar alterações' : 'Criar rota'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-safebus-blue" /></div>
        ) : routes.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">Nenhuma rota encontrada. Cria a primeira rota.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {routes.map(r => (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-safebus-blue/10 rounded-lg"><Route className="h-5 w-5 text-safebus-blue" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.name}</h3>
                      <p className="text-sm text-gray-500">{r.start_location || '—'} → {r.end_location || '—'} · {r.total_stops || 0} paragens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SchoolRoutes;