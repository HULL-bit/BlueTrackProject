import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Ship, 
  Shield, 
  History, 
  User, 
  Activity, 
  Satellite,
  FileText,
  LogOut,
  Menu,
  X,
  Anchor,
  Waves,
  Building2,
  Anchor as AnchorIcon,
  MessageCircle,
  Image,
  CloudRain,
  Settings,
  Warehouse,
  TestTube,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  isSidebarOpen, 
  onToggleSidebar 
}) => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
      { id: 'map', label: 'Carte Marine', icon: Map },
      { id: 'history', label: 'Historique', icon: History },
      { id: 'weather', label: 'Météo', icon: CloudRain },
      { id: 'profile', label: 'Profil', icon: User },
    ];

    // Éléments pour tous les utilisateurs
    const commonItems = [
      { id: 'armateurs', label: 'Armateurs', icon: Building2 },
      { id: 'quais', label: 'Quais', icon: Warehouse },
      { id: 'media', label: 'Galerie Média', icon: Image },
      { id: 'donations', label: 'Donations', icon: Heart },
      { id: 'support', label: 'Support', icon: MessageCircle },
    ];

    // Ajouter les éléments communs
    baseItems.push(...commonItems);

    // Éléments spécifiques selon le rôle
    if (user?.role === 'fisherman') {
      // Les pêcheurs n'ont pas accès aux balises et pirogues
      // Ils gardent seulement les éléments de base
    } else {
      // Les organisations et admins ont accès aux balises et pirogues
      baseItems.splice(-5, 0, 
        { id: 'balises', label: 'Balises', icon: AnchorIcon },
        { id: 'pirogues', label: 'Pirogues', icon: Ship }
      );
    }

    // Éléments réservés aux organisations et administrateurs
    if (user?.role === 'organization' || user?.role === 'admin') {
      baseItems.splice(2, 0, 
        { id: 'gps-tracking', label: 'Pirogue GPS Tracking', icon: Satellite },
        { id: 'fleet', label: 'Gestion Flotte', icon: Ship },
        { id: 'users', label: 'Utilisateurs', icon: Users }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        { id: 'zones', label: 'Zones', icon: Shield },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'logs', label: 'Logs Système', icon: FileText },
        { id: 'tests', label: 'Tests Système', icon: TestTube }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"
          >
            <Logo size="sm" variant="icon" className="text-primary-600" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              BLUE TRACK
            </h1>
            <p className="text-xs text-gray-600">Tracking the sea, protecting lives</p>
          </div>
        </div>
        
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-primary-900 shadow-2xl border-r border-primary-800 lg:translate-x-0"
          >
            {/* Header avec logo pirogue */}
            <div className="p-6 border-b border-primary-800 bg-gradient-to-br from-primary-800 to-primary-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Logo size="sm" variant="icon" className="text-primary-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-400 rounded-full animate-pulse"></div>
                    <Waves className="absolute -bottom-2 -right-2 w-4 h-4 text-primary-300 opacity-60" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      BLUE TRACK
                    </h1>
                    <p className="text-sm text-primary-200 font-medium">Tracking the sea, protecting lives</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleSidebar}
                  className="p-3 text-white hover:bg-primary-700 rounded-xl transition-colors"
                  title="Réduire le sidebar"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* User info */}
            <div className="p-4 border-b border-primary-800 bg-gradient-to-r from-primary-800 to-primary-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.profile?.fullName || user?.email || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-primary-200 capitalize">
                    {user?.role === 'fisherman' ? 'Pêcheur' : 
                     user?.role === 'organization' ? 'Organisation' : 'Administrateur'}
                  </p>
                  {user?.profile?.boatName && (
                    <p className="text-xs text-primary-300 font-medium">
                      🚢 {user.profile?.boatName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                        : 'text-white hover:bg-primary-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer avec déconnexion */}
            <div className="p-4 border-t border-primary-800">
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Collapsed sidebar pour desktop */}
      {!isSidebarOpen && (
        <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-20 bg-primary-900 shadow-lg border-r border-primary-800">
          <div className="p-4 border-b border-primary-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onToggleSidebar}
              className="w-14 h-14 bg-white rounded-xl flex items-center justify-center"
            >
              <Logo size="sm" variant="icon" className="text-primary-600" />
            </motion.button>
          </div>
          
          <nav className="p-2 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onViewChange(item.id)}
                  title={item.label}
                  className={`
                    w-full h-12 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                       : 'text-white hover:bg-primary-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;