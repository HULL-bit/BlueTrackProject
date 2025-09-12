import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';

// Components
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import UserManagement from './components/UserManagement';
import FleetManagement from './components/FleetManagement';
import ZoneManagement from './components/ZoneManagement';
import TripHistory from './components/TripHistory';
import ProfileSettings from './components/ProfileSettings';
import SystemMonitoring from './components/SystemMonitoring';
import ChatWidget from './components/ChatWidget';
import EmergencyButton from './components/EmergencyButton';
import GPSTracking from './components/GPSTracking';
import LogsViewer from './components/LogsViewer';
import ArmateursManagement from './components/ArmateursManagement';
import SupportCenter from './components/SupportCenter';
import BaliseManagement from './components/BaliseManagement';
import MediaGallery from './components/MediaGallery';
import PirogueManagement from './components/PirogueManagement';
import QuaiManagement from './components/QuaiManagement';
import WeatherWidget from './components/WeatherWidget';
import TestPanel from './components/TestPanel';
import DonationPanel from './components/DonationPanel';
//import MarineMap from './components/MarineMap';
// Navigation
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: dataLoading } = useData();
 const [activeView, setActiveView] = useState("login");

// Sauvegarde quand on change
useEffect(() => {
  localStorage.setItem("activeView", activeView);
}, [activeView]);

// Forcer retour au dashboard à chaque refresh
useEffect(() => {
  setActiveView("login");  // ou "login"
}, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

   useEffect(() => {
    setActiveView("login");
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">BLUE TRACK</h2>
          <p className="text-primary-600">Chargement de l'application...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
  switch (activeView) {
    case 'dashboard':
      return <Dashboard />;
    case 'map':
      return <MapView />;
    case 'users':
      return <UserManagement />;
    case 'fleet':
      return <FleetManagement />;
    case 'zones':
      return <ZoneManagement />;
    case 'history':
      return <TripHistory />;
    case 'profile':
      return <ProfileSettings />;
    case 'monitoring':
      return <SystemMonitoring />;
    case 'gps-tracking':
      return <GPSTracking />;
    case 'logs':
      return <LogsViewer />;
    case 'armateurs':
      return <ArmateursManagement />;
    case 'support':
      return <SupportCenter />;
    case 'balises':
      return <BaliseManagement />;
    case 'media':
      return <MediaGallery />;
    case 'pirogues':
      return <PirogueManagement />;
    case 'quais':
      return <QuaiManagement />;
    case 'weather':
      return <WeatherWidget />;
    case 'tests':
      return <TestPanel />;
    case 'donations':
      return <DonationPanel />;
    default:
      return <Dashboard />;
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100/50 to-primary-200/30">
      <Navigation 
        activeView={activeView} 
        onViewChange={setActiveView}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <main className="min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating components */}
     <div> 
      <ChatWidget />
     </div>
     <div>
      <EmergencyButton />
      </div>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {dataLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center space-x-4">
              <div className="w-8 h-8 border-4 border-maritime-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-maritime-800 font-medium">Synchronisation des données...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    
    
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;