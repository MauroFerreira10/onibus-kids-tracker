import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Map, User, Calendar, LogOut, BellRing, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Simular 3 notificações não lidas
  const unreadNotifications = 3;
  
  // Verificar o papel do usuário atual
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
      }
    };
    
    if (user?.id) {
      checkUserRole();
    }
  }, [user]);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const isNearBottom = window.innerHeight - event.clientY < 100;

      if (isNearBottom) {
        setIsVisible(true);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      } else {
        if (!timeoutId) {
          const id = setTimeout(() => {
            setIsVisible(false);
            setTimeoutId(null);
          }, 500);
          setTimeoutId(id);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  const navItems = [
    { label: 'Mapa', path: '/', icon: Map },
    { label: 'Rotas', path: '/routes', icon: Bus },
    { label: 'Horários', path: '/schedule', icon: Calendar },
    { 
      label: 'Notificações', 
      path: '/notifications', 
      icon: BellRing,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined 
    },
    { label: 'Perfil', path: '/profile', icon: User }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10 shadow-lg transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <ul className="flex justify-around items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex flex-col items-center p-2 transition-all duration-200 ${
                  isActive 
                    ? 'text-busapp-primary scale-110' 
                    : 'text-gray-500 hover:text-busapp-accent'
                }`}
              >
                <div className={`p-2 rounded-full ${isActive ? 'bg-busapp-primary/10' : ''} relative`}>
                  <IconComponent size={20} />
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-busapp-primary mt-1"></span>
                )}
              </Link>
            </li>
          );
        })}
        
        {/* Botão de Motorista */}
        {userRole === 'driver' && (
          <li>
            <Link 
              to="/driver/dashboard" 
              className={`flex flex-col items-center p-2 transition-all duration-200 ${
                location.pathname.includes('/driver') 
                  ? 'text-busapp-primary scale-110' 
                  : 'text-gray-500 hover:text-busapp-accent'
              }`}
            >
              <div className={`p-2 rounded-full ${location.pathname.includes('/driver') ? 'bg-busapp-primary/10' : ''}`}>
                <Bus size={20} />
              </div>
              <span className="text-xs mt-1">Motorista</span>
              {location.pathname.includes('/driver') && (
                <span className="w-1.5 h-1.5 rounded-full bg-busapp-primary mt-1"></span>
              )}
            </Link>
          </li>
        )}
        
        {/* Botão de Gestor */}
        {userRole === 'manager' && (
          <li>
            <Link 
              to="/manager/dashboard" 
              className={`flex flex-col items-center p-2 transition-all duration-200 ${
                location.pathname.includes('/manager') 
                  ? 'text-busapp-primary scale-110' 
                  : 'text-gray-500 hover:text-busapp-accent'
              }`}
            >
              <div className={`p-2 rounded-full ${location.pathname.includes('/manager') ? 'bg-busapp-primary/10' : ''}`}>
                <LayoutDashboard size={20} />
              </div>
              <span className="text-xs mt-1">Gestor</span>
              {location.pathname.includes('/manager') && (
                <span className="w-1.5 h-1.5 rounded-full bg-busapp-primary mt-1"></span>
              )}
            </Link>
          </li>
        )}
        
        <li>
          <button
            onClick={signOut}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <div className="p-2 rounded-full">
              <LogOut size={20} />
            </div>
            <span className="text-xs mt-1">Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
