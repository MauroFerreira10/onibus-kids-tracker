
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import DriverDashboardButton from './driver/DriverDashboardButton';
import { Helmet } from 'react-helmet';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, hideNavigation = false }) => {
  const { user } = useAuth();
  
  // Check if the user is a driver (in a real app, this would check the actual user role)
  const isDriver = user !== null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {title && (
        <Helmet>
          <title>{title} | BusApp</title>
        </Helmet>
      )}
      {!hideNavigation && <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      {isDriver && <DriverDashboardButton />}
    </div>
  );
};

export default Layout;
