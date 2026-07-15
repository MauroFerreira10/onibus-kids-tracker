import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Route, Users, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SchoolDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ routes: 0, students: 0, drivers: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.school_id) return;
    const load = async () => {
      try {
        const schoolId = profile.school_id;
        const [routes, students, vehicles] = await Promise.all([
          supabase.from('routes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
        ]);
        setStats({
          routes: routes.count || 0,
          students: students.count || 0,
          drivers: 0,
          vehicles: vehicles.count || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.school_id]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-safebus-blue">Painel Escolar</h1>
          <p className="text-gray-500 text-sm">Bem-vindo, {profile?.name}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-safebus-blue" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/school/routes">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Rotas</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-safebus-blue">{stats.routes}</div>
                  <Route className="h-8 w-8 text-blue-200 absolute bottom-4 right-4" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/school/students">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Alunos</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-safebus-blue">{stats.students}</div>
                  <Users className="h-8 w-8 text-amber-200 absolute bottom-4 right-4" />
                </CardContent>
              </Card>
            </Link>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Motoristas</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-safebus-blue">{stats.drivers}</div>
                <UserCheck className="h-8 w-8 text-green-200 absolute bottom-4 right-4" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium">Veículos</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-safebus-blue">{stats.vehicles}</div>
                <Bus className="h-8 w-8 text-purple-200 absolute bottom-4 right-4" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg text-safebus-blue">Acesso Rápido</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/school/routes" className="block p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-safebus-blue font-medium">Gerir Rotas</Link>
              <Link to="/school/students" className="block p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-safebus-blue font-medium">Gerir Alunos</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg text-safebus-blue">Informação</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Este painel permite gerir as rotas, alunos e veículos da tua escola.</p>
              <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> As alterações são aplicadas em tempo real.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolDashboard;