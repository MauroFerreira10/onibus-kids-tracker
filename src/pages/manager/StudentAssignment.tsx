import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, MapPin, Bus, Save, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudentRow {
  id: string;
  name: string;
  student_number: string | null;
  route_id: string | null;
  stop_id: string | null;
  profile_name: string | null;
  email: string | null;
}

interface Route { id: string; name: string; }
interface Stop { id: string; name: string; route_id: string; }

const StudentAssignment = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, { route_id: string; stop_id: string }>>({});

  useEffect(() => {
    checkManagerRole();
    loadData();
  }, []);

  const checkManagerRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!data || data.role !== 'manager') { navigate('/'); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar todos os utilizadores com role=student via profiles
      // e fazer LEFT JOIN com students para ver se já têm rota
      const [{ data: profilesData }, { data: studentsData }, { data: routesData }, { data: stopsData }] = await Promise.all([
        supabase.from('profiles').select('id, name, email: id').eq('role', 'student'),
        supabase.from('students').select('id, name, student_number, route_id, stop_id'),
        supabase.from('routes').select('id, name').order('name'),
        supabase.from('stops').select('id, name, route_id').order('sequence_number', { ascending: true }),
      ]);

      // Unir profiles com students
      const studentsMap = new Map((studentsData || []).map(s => [s.id, s]));

      // Buscar emails dos profiles via auth — não disponível client-side, usar name como fallback
      const merged: StudentRow[] = (profilesData || []).map(p => {
        const s = studentsMap.get(p.id);
        return {
          id: p.id,
          name: s?.name || p.name || 'Sem nome',
          student_number: s?.student_number || null,
          route_id: s?.route_id || null,
          stop_id: s?.stop_id || null,
          profile_name: p.name,
          email: null,
        };
      });

      setStudents(merged);
      setRoutes(routesData || []);
      setStops(stopsData || []);
    } finally {
      setLoading(false);
    }
  };

  const getStopsForRoute = (routeId: string) => stops.filter(s => s.route_id === routeId);

  const getRouteName = (routeId: string | null) => routes.find(r => r.id === routeId)?.name || '—';
  const getStopName = (stopId: string | null) => stops.find(s => s.id === stopId)?.name || '—';

  const handleRouteChange = (studentId: string, routeId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [studentId]: { route_id: routeId, stop_id: '' }
    }));
  };

  const handleStopChange = (studentId: string, stopId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], stop_id: stopId }
    }));
  };

  const getCurrentRouteId = (student: StudentRow) =>
    pendingChanges[student.id]?.route_id ?? student.route_id ?? '';

  const getCurrentStopId = (student: StudentRow) =>
    pendingChanges[student.id]?.stop_id ?? student.stop_id ?? '';

  const saveAssignment = async (student: StudentRow) => {
    const change = pendingChanges[student.id];
    const routeId = change?.route_id || student.route_id;
    const stopId = change?.stop_id || student.stop_id;

    if (!routeId || !stopId) {
      toast.error('Selecione uma rota e uma paragem antes de guardar.');
      return;
    }

    setSaving(student.id);
    try {
      // Upsert na tabela students
      const { error } = await supabase.from('students').upsert({
        id: student.id,
        name: student.name,
        student_number: student.student_number,
        route_id: routeId,
        stop_id: stopId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (error) throw error;

      toast.success(`Rota e paragem atribuídas a ${student.name}!`);

      // Atualizar estado local
      setStudents(prev => prev.map(s =>
        s.id === student.id ? { ...s, route_id: routeId, stop_id: stopId } : s
      ));
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
    } catch (err: any) {
      toast.error('Erro ao guardar: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.student_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const unassigned = filteredStudents.filter(s => !s.route_id || !s.stop_id);
  const assigned = filteredStudents.filter(s => s.route_id && s.stop_id);

  return (
    <Layout title="Atribuição de Rotas">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Atribuição de Rotas a Alunos</h1>
            <p className="text-gray-500 text-sm mt-1">
              Associe cada aluno a uma rota e paragem para que possam confirmar presença
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/manager/dashboard')}>
            Voltar ao Painel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-gray-500">Total de alunos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.filter(s => !s.route_id || !s.stop_id).length}</p>
                  <p className="text-xs text-gray-500">Sem rota atribuída</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.filter(s => s.route_id && s.stop_id).length}</p>
                  <p className="text-xs text-gray-500">Com rota atribuída</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome ou número de estudante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">A carregar alunos...</div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nenhum aluno registado</p>
              <p className="text-sm mt-1">Registe alunos na página de registo do gestor</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Unassigned students */}
            {unassigned.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-amber-700 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" />
                  Sem rota atribuída ({unassigned.length})
                </h2>
                <div className="space-y-3">
                  {unassigned.map(student => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      routes={routes}
                      stopsForRoute={getStopsForRoute(getCurrentRouteId(student))}
                      currentRouteId={getCurrentRouteId(student)}
                      currentStopId={getCurrentStopId(student)}
                      onRouteChange={routeId => handleRouteChange(student.id, routeId)}
                      onStopChange={stopId => handleStopChange(student.id, stopId)}
                      onSave={() => saveAssignment(student)}
                      saving={saving === student.id}
                      hasPending={!!pendingChanges[student.id]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assigned students */}
            {assigned.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-green-700 flex items-center gap-2 mb-3">
                  <Bus className="w-4 h-4" />
                  Com rota atribuída ({assigned.length})
                </h2>
                <div className="space-y-3">
                  {assigned.map(student => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      routes={routes}
                      stopsForRoute={getStopsForRoute(getCurrentRouteId(student))}
                      currentRouteId={getCurrentRouteId(student)}
                      currentStopId={getCurrentStopId(student)}
                      onRouteChange={routeId => handleRouteChange(student.id, routeId)}
                      onStopChange={stopId => handleStopChange(student.id, stopId)}
                      onSave={() => saveAssignment(student)}
                      saving={saving === student.id}
                      hasPending={!!pendingChanges[student.id]}
                      assignedRouteName={getRouteName(student.route_id)}
                      assignedStopName={getStopName(student.stop_id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

interface StudentRowProps {
  student: StudentRow;
  routes: Route[];
  stopsForRoute: Stop[];
  currentRouteId: string;
  currentStopId: string;
  onRouteChange: (routeId: string) => void;
  onStopChange: (stopId: string) => void;
  onSave: () => void;
  saving: boolean;
  hasPending: boolean;
  assignedRouteName?: string;
  assignedStopName?: string;
}

const StudentRow = ({
  student,
  routes,
  stopsForRoute,
  currentRouteId,
  currentStopId,
  onRouteChange,
  onStopChange,
  onSave,
  saving,
  hasPending,
  assignedRouteName,
  assignedStopName,
}: StudentRowProps) => (
  <Card className={`border ${hasPending ? 'border-blue-300 bg-blue-50/30' : student.route_id && student.stop_id ? 'border-green-200' : 'border-amber-200'}`}>
    <CardContent className="py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Student info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{student.name}</p>
            {student.student_number && (
              <Badge variant="outline" className="text-xs text-gray-500">
                Nº {student.student_number}
              </Badge>
            )}
            {student.route_id && student.stop_id && !hasPending && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Atribuído</Badge>
            )}
            {hasPending && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Alteração pendente</Badge>
            )}
          </div>
          {assignedRouteName && assignedStopName && !hasPending && (
            <p className="text-xs text-gray-500 mt-1">
              {assignedRouteName} → {assignedStopName}
            </p>
          )}
        </div>

        {/* Selects */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={currentRouteId} onValueChange={onRouteChange}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Selecionar rota" />
            </SelectTrigger>
            <SelectContent>
              {routes.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentStopId}
            onValueChange={onStopChange}
            disabled={!currentRouteId}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={currentRouteId ? "Selecionar paragem" : "Rota primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {stopsForRoute.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={onSave}
            disabled={saving || (!hasPending && !!student.route_id && !!student.stop_id)}
            size="sm"
            className="bg-safebus-blue hover:bg-safebus-blue/90 shrink-0"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StudentAssignment;
