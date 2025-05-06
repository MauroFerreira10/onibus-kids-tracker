
import React from 'react';
import Layout from '@/components/Layout';
import { useRoutes } from '@/hooks/useRoutes';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesLoading } from '@/components/routes/RoutesLoading';
import { EmptyRoutes } from '@/components/routes/EmptyRoutes';
import { useAuth } from '@/contexts/AuthContext';

const Routes = () => {
  const { routes, isLoading, attendanceStatus, markPresentAtStop } = useRoutes();
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">Rotas Ativas em Lubango</h2>
          
          {isLoading ? (
            <RoutesLoading />
          ) : routes.length > 0 ? (
            <RoutesList 
              routes={routes}
              attendanceStatus={attendanceStatus}
              markPresentAtStop={markPresentAtStop}
              user={user}
            />
          ) : (
            <EmptyRoutes />
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Routes;
