import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GlobalNotifications } from './notifications/GlobalNotifications';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, hideNavigation = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChatButtonClick = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {title && (
        <title>{title} | BusApp</title>
      )}
      {!hideNavigation && <Navbar />}
      <GlobalNotifications />
      <Toaster 
        richColors 
        position="top-right"
        expand={true}
        closeButton={true}
        theme="light"
        style={{ zIndex: 9999 }}
      />
      <main className="flex-1 container mx-auto px-4 py-6 pb-16">
        {children}
      </main>

      {user && !hideNavigation && (
        <Button
          className="fixed bottom-1/3 right-6 rounded-full p-4 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleChatButtonClick}
          aria-label="Abrir Chat"
        >
          <MessageCircle size={24} />
        </Button>
      )}
    </div>
  );
};

export default Layout;
