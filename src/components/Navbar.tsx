
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Map, User, Calendar } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Mapa', path: '/', icon: Map },
    { label: 'Rotas', path: '/routes', icon: Bus },
    { label: 'Horários', path: '/schedule', icon: Calendar },
    { label: 'Perfil', path: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  isActive 
                    ? 'text-busapp-primary' 
                    : 'text-gray-500 hover:text-busapp-accent'
                }`}
              >
                <IconComponent size={24} />
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-busapp-primary mt-1"></span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
