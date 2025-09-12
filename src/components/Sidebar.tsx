import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  Ship,
  Navigation,
  Shield,
  BarChart3,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentPath }) => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Tableau de bord',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Vue d\'ensemble du système'
      },
      {
        name: 'Carte Marine',
        href: '/map',
        icon: MapPin,
        description: 'Suivi GPS des pirogues'
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        description: 'Communication'
      },
      {
        name: 'Alertes',
        href: '/alerts',
        icon: Bell,
        description: 'Alertes et notifications'
      },
      {
        name: 'Documents',
        href: '/documents',
        icon: FileText,
        description: 'Gestion des documents'
      },
      {
        name: 'Paramètres',
        href: '/settings',
        icon: Settings,
        description: 'Configuration'
      },
      {
        name: 'Donations',
        href: '/donations',
        icon: Heart,
        description: 'Soutenir Blue-Track'
      },
      {
        name: 'Aide',
        href: '/help',
        icon: HelpCircle,
        description: 'Support et aide'
      }
    ];

    // Éléments spécifiques selon le rôle
    if (user?.role === 'fisherman') {
      // Les pêcheurs n'ont pas accès aux balises et pirogues
      return baseItems;
    } else {
      // Les organisations et admins ont accès aux balises et pirogues
      const adminItems = [
        {
          name: 'Pirogues',
          href: '/pirogues',
          icon: Ship,
          description: 'Gestion des pirogues'
        },
        {
          name: 'Dispositifs GPS',
          href: '/devices',
          icon: Navigation,
          description: 'Gestion des trackers',
          adminOnly: true
        },
        {
          name: 'Utilisateurs',
          href: '/users',
          icon: Users,
          description: 'Gestion des utilisateurs',
          adminOnly: true
        },
        {
          name: 'Statistiques',
          href: '/stats',
          icon: BarChart3,
          description: 'Analyses et rapports',
          adminOnly: true
        },
        {
          name: 'Zones',
          href: '/zones',
          icon: Shield,
          description: 'Gestion des zones'
        }
      ];
      
      // Insérer les éléments admin après la carte marine
      baseItems.splice(2, 0, ...adminItems);
      return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || (user?.role === 'admin' || user?.role === 'organization')
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-0 left-0 z-50 h-full w-80
          bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900
          border-r border-primary-700/50 backdrop-blur-xl
          shadow-2xl shadow-primary-900/20
          lg:translate-x-0 lg:opacity-100 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-700/50">
          <div className="flex items-center justify-between">
            <Logo size="sm" variant="wordmark" darkBackground={true} />
            <button
              onClick={onToggle}
              className="lg:hidden p-2 text-primary-300 hover:text-white hover:bg-primary-700/50 rounded-lg transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item, index) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white border-r-2 border-blue-500 shadow-glow-secondary' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:translate-x-1'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 w-5 h-5 transition-all duration-300
                  ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}
                `}>
                  <Icon className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.profile?.fullName || user?.email}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'fisherman' ? 'Pêcheur' : 
                 user?.role === 'organization' ? 'Organisation' : 
                 user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full mt-3 flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Pirogue Connect v1.0
            </p>
            <p className="text-xs text-slate-600 mt-1">
              © 2024 Sénégal
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
