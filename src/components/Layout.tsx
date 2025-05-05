
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, hideNavigation = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {title && (
        <title>{title} | BusApp</title>
      )}
      {!hideNavigation && <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
