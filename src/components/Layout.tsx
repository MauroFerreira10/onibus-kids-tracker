
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
      <header className="bg-busapp-primary text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <div className="flex items-center">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white mr-3"
            >
              <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
              <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
            </svg>
            <h1 className="text-xl font-bold">Ônibus Kids Tracker</h1>
          </div>
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
          <div className="flex items-center">
            {getPageIcon(location.pathname)}
            <h2 className="text-lg font-medium text-gray-800 ml-2">{pageTitle}</h2>
          </div>
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

function getPageIcon(pathname: string): React.ReactNode {
  switch (pathname) {
    case '/':
      return (
        <svg className="w-5 h-5 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 20L3.55 17.425C3.15032 17.2344 2.81353 16.9259 2.58035 16.5389C2.34716 16.152 2.22618 15.7045 2.23 15.25V5.75C2.2296 5.28731 2.36223 4.83338 2.60737 4.44126C2.8525 4.04913 3.19813 3.73491 3.6125 3.54C4.02796 3.3428 4.48416 3.26803 4.9357 3.32386C5.38725 3.37969 5.81666 3.56394 6.175 3.85L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 6L12.825 3.85C13.1833 3.56394 13.6127 3.37969 14.0643 3.32386C14.5158 3.26803 14.972 3.3428 15.3875 3.54C15.8019 3.73491 16.1475 4.04913 16.3926 4.44126C16.6378 4.83338 16.7704 5.28731 16.77 5.75V15.25C16.7738 15.7045 16.6528 16.152 16.4197 16.5389C16.1865 16.9259 15.8497 17.2344 15.45 17.425L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case '/routes':
      return (
        <svg className="w-5 h-5 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
          <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
        </svg>
      );
    case '/schedule':
      return (
        <svg className="w-5 h-5 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case '/profile':
      return (
        <svg className="w-5 h-5 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2.90625 20.2491C3.82775 18.6531 5.1537 17.3278 6.75 16.4064C8.3463 15.485 10.1547 15 12 15C13.8453 15 15.6537 15.4851 17.25 16.4065C18.8463 17.3279 20.1722 18.6533 21.0938 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-busapp-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 8h20" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
          <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
        </svg>
      );
  }
}

export default Layout;
