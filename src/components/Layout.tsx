
import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, hideNavigation = false }) => {
  const location = useLocation();
  const pageTitle = title || getPageTitle(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-busapp-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <h1 className="text-xl font-bold">Ônibus Kids Tracker</h1>
          <span className="ml-2 text-sm bg-busapp-secondary text-busapp-dark px-2 py-0.5 rounded-full">
            Beta
          </span>
          <div className="ml-auto flex items-center space-x-4">
            {/* Área para possíveis ações no cabeçalho */}
          </div>
        </div>
      </header>
      
      {/* Page Title */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      
      {/* Navigation */}
      {!hideNavigation && <Navbar />}
      
      {/* Add padding to the bottom when navbar is present */}
      {!hideNavigation && <div className="h-16"></div>}
    </div>
  );
};

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'Mapa ao vivo';
    case '/routes':
      return 'Rotas e Paradas';
    case '/schedule':
      return 'Horários';
    case '/profile':
      return 'Perfil';
    case '/login':
      return 'Login';
    case '/register':
      return 'Cadastro';
    default:
      if (pathname.startsWith('/bus/')) {
        return 'Detalhes do Ônibus';
      }
      return 'Ônibus Escolar';
  }
}

export default Layout;
