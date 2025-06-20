import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import { GlobalNotifications } from './notifications/GlobalNotifications';
import { Toaster } from 'sonner';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        toastOptions={{
          duration: 5000,
          style: {
            background: 'white',
            color: '#333',
            border: '1px solid #e5e7eb',
          },
        }}
      />
      <main className="flex-1 container mx-auto px-4 py-6 pb-16">
        {children}
      </main>

      <AnimatePresence>
        {user && !hideNavigation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-1/3 right-6 z-50"
          >
            <div className="relative">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              
              {/* Efeito de pulso */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
              
              {/* Botão principal */}
              <Button
                className="relative rounded-full p-5 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30"
                onClick={handleChatButtonClick}
                aria-label="Abrir Chat"
              >
                <MessageCircle size={28} className="animate-bounce" />
              </Button>
              
              {/* Badge de notificação */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
              >
                3
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
