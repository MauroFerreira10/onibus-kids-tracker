import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Pencil, Trash2, Loader2, Search } from 'lucide-react';

interface StudentRecord {
  id: string;
  name: string;
  student_number: string | null;
  grade: string | null;
  classroom: string | null;
  route_id: string | null;
  stop_id: string | null;
  pickup_address: string | null;
}

interface RouteOption {
  id: string;
  name: string;
}

interface StopOption {
  id: string;
  name: string;
}

const Students = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [stops, setStops] = useState<StopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStudents = async () => {
    if (!profile?.school_id) return;
    try {
      const { data } = await supabase.from('students').select('*').order('name');
      setStudents(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadRoutes = async () => {
    if (!profile?.school_id) return;
    const { data } = await supabase.from('routes').select('id, name').eq('school_id', profile.school_id).eq('status', 'active');
    setRoutes(data || []);
  };

  useEffect(() => {
    loadStudents();
    loadRoutes();
  }, [profile?.school_id]);

  const handleAssignRoute = async (studentId: string, routeId: string | null) => {
    try {
      await supabase.from('students').update({ route_id: routeId, stop_id: null }).eq('id', studentId);
      toast.success('Rota atribuída');
      loadStudents();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAssignStop = async (studentId: string, stopId: string) => {
    try {
      await supabase.from('students').update({ stop_id: stopId }).eq('id', studentId);
      toast.success('Paragem atribuída');
      loadStudents();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleLoadStops = async (routeId: string) => {
    const { data } = await supabase.from('stops').select('id, name').eq('route_id', routeId).order('sequence_number');
    setStops(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza?')) return;
    try {
      await supabase.from('students').delete().eq('id', id);
      toast.success('Aluno removido');
      loadStudents();
    } catch (err: any) { toast.error(err.message); }
  };

  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.student_number?.includes(search));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-safebus-blue">Alunos</h1><p className="text-sm text-gray-500">Gerir alunos e atribuir rotas</p></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 w-64" placeholder="Procurar aluno..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-safebus-blue" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">Nenhum aluno encontrado.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-safebus-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                          <p className="text-xs text-gray-500">{s.student_number ? `Nº ${s.student_number}` : 'Sem número'}{s.classroom ? ` · ${s.classroom}` : ''}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Select
                        value={s.route_id || ''}
                        onValueChange={v => {
                          handleAssignRoute(s.id, v || null);
                          if (v) handleLoadStops(v);
                        }}
                      >
                        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Rota" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">Sem rota</SelectItem>
                          {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Select
                        key={s.route_id}
                        value={s.stop_id || ''}
                        onValueChange={v => handleAssignStop(s.id, v)}
                        disabled={!s.route_id}
                      >
                        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Paragem" /></SelectTrigger>
                        <SelectContent>
                          {stops.filter(st => !s.route_id || true).map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Students;