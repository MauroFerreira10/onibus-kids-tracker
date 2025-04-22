
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { User, Bus, Clock, MapPin } from 'lucide-react';
import { UserData } from '@/types';
import { generateMockUsers } from '@/services/mockData';

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular autenticação do usuário
    setTimeout(() => {
      const users = generateMockUsers();
      setUser(users[0]); // Selecionando o pai como usuário de exemplo
      setIsLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : user ? (
          <>
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.photo} alt={user.name} />
                <AvatarFallback className="bg-busapp-primary text-white text-xl">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
              <p className="text-gray-500 capitalize">
                {user.role === 'parent' ? 'Responsável' : 
                 user.role === 'student' ? 'Aluno' : 
                 user.role === 'manager' ? 'Gestor' : 'Motorista'}
              </p>
              
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">Editar perfil</Button>
                <Button variant="outline" size="sm">Configurações</Button>
              </div>
            </div>
            
            <Separator />
            
            {user.role === 'parent' && user.children && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Estudantes vinculados</h3>
                <div className="space-y-4">
                  {user.children.map(child => (
                    <Card key={child.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <CardDescription>Estudante</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Bus size={16} className="mr-2 text-busapp-primary" />
                            <span>Rota: {child.routeName}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-busapp-primary" />
                            <span>Parada: {child.stopName}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="secondary" size="sm" className="w-full">
                          Ver detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            )}
            
            {user.role === 'driver' && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Informações do motorista</h3>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Ônibus atribuído</CardTitle>
                    <CardDescription>Informações da rota</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Bus size={16} className="mr-2 text-busapp-primary" />
                        <span>ID do ônibus: {user.associatedBusId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
            
            <section>
              <h3 className="text-lg font-semibold mb-4">Informações de contato</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-busapp-primary" />
                        <span className="text-gray-500">Email</span>
                      </div>
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mr-2 text-busapp-primary"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span className="text-gray-500">Telefone</span>
                        </div>
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <section className="pt-4">
              <Button variant="destructive" className="w-full">Sair</Button>
            </section>
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Você não está conectado</h2>
            <p className="mb-6 text-gray-600">
              Faça login para acessar seu perfil e gerenciar suas configurações
            </p>
            <div className="space-x-4">
              <Button asChild variant="default">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Criar conta</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
