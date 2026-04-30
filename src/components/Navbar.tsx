import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Map, User, Calendar, LogOut, BellRing, LayoutDashboard, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isDriver, isManager } = useUserProfile();

  // Itens base sempre presentes
  const coreItems = [
    { label: 'Mapa', path: '/', icon: Map },
    { label: 'Rotas', path: '/routes', icon: Bus },
    { label: 'Horários', path: '/schedule', icon: Calendar },
    { label: 'Alertas', path: '/notifications', icon: BellRing },
    { label: 'Perfil', path: '/profile', icon: User },
  ];

  // Itens extra consoante o role
  const extraItems = [
    ...(isDriver ? [{ label: 'Painel', path: '/driver/dashboard', icon: Bus }] : []),
    ...(isManager ? [{ label: 'Gestor', path: '/manager/dashboard', icon: LayoutDashboard }] : []),
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const NavLink = ({ item }: { item: typeof coreItems[0] }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        className={`flex flex-col items-center gap-0.5 px-1 py-1.5 min-w-0 transition-all duration-200 ${
          active ? 'text-safebus-blue' : 'text-gray-500 hover:text-safebus-blue'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-safebus-blue/10' : ''}`}>
          <item.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span className="text-[10px] font-medium leading-none truncate max-w-[48px] text-center">{item.label}</span>
        {active && <span className="w-1 h-1 rounded-full bg-safebus-blue" />}
      </Link>
    );
  };

  // Se tem itens extra → mostrar core na barra + extra no menu hambúrguer
  // Se não tem → mostrar tudo na barra normalmente
  const hasExtra = extraItems.length > 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-lg safe-area-inset-bottom">
      <ul className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {coreItems.map(item => (
          <li key={item.path} className="flex-1 flex justify-center">
            <NavLink item={item} />
          </li>
        ))}

        {/* Menu hambúrguer para itens extra (motorista/gestor) */}
        {hasExtra && (
          <li className="flex-1 flex justify-center">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-0.5 px-1 py-1.5 text-gray-500 hover:text-safebus-blue transition-colors">
                  <div className="p-1.5 rounded-xl">
                    <Menu size={20} strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-medium leading-none">Mais</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl pb-8">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left text-safebus-blue">Acções</SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {extraItems.map(item => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                          active ? 'bg-safebus-blue text-white' : 'bg-gray-50 hover:bg-safebus-blue/5 text-gray-700'
                        }`}
                      >
                        <item.icon size={22} />
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <LogOut size={22} />
                    <span className="font-semibold">Sair</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </li>
        )}

        {/* Sair directo se não há itens extra */}
        {!hasExtra && (
          <li className="flex-1 flex justify-center">
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 px-1 py-1.5 text-gray-500 hover:text-red-500 transition-colors"
            >
              <div className="p-1.5 rounded-xl">
                <LogOut size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-medium leading-none">Sair</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
