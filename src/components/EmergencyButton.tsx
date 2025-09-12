import React, { useState } from 'react';
import { AlertTriangle, Phone, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const EmergencyButton: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { createAlert, updateLocation } = useData();
  const { user } = useAuth();

  const handleEmergencyClick = () => {
    if (isActive) return;

    setIsActive(true);
    setCountdown(5);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerEmergency = () => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            userId: user!.id.toString(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: 0,
            heading: 0
          };

          updateLocation(location);

          createAlert({
            userId: user!.id.toString(),
            type: 'emergency',
            message: `🚨 ALERTE URGENCE - ${user!.profile.full_name} demande assistance immédiate`,
            location: {
              id: Date.now().toString(),
              userId: user!.id.toString(),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
              speed: 0,
              heading: 0
            },
            severity: 'critical'
          });
        },
        () => {
          // Fallback if geolocation fails
          createAlert({
            userId: user!.id.toString(),
            type: 'emergency',
            message: `🚨 ALERTE URGENCE - ${user!.profile.full_name} demande assistance immédiate (position non disponible)`,
            severity: 'critical'
          });
        }
      );
    }

    setTimeout(() => {
      setIsActive(false);
    }, 5000);
  };

  const handleCancel = () => {
    setIsActive(false);
    setCountdown(0);
  };

  return (
    <div className="fixed bottom-6 left-48 z-50">
      <AnimatePresence>
        {isActive && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 border-2 border-red-500 min-w-80"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="text-red-600 font-bold text-xl mb-2">
                ALERTE D'URGENCE
              </div>
              
              <motion.div 
                key={countdown}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold text-red-600 mb-4"
              >
                {countdown}
              </motion.div>
              
              <p className="text-sm text-gray-600 mb-4">
                L'alerte sera envoyée automatiquement aux secours...
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                ANNULER
              </motion.button>
            </div>
          </motion.div>
        )}

        {isActive && countdown === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 bg-red-600 text-white rounded-2xl shadow-2xl p-6 min-w-80"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
              </div>
              
              <div className="font-bold text-lg mb-2">
                🚨 ALERTE ENVOYÉE
              </div>
              
              <p className="text-sm mb-3 text-red-100">
                Les secours ont été alertés avec votre position
              </p>
              
              <div className="flex items-center justify-center text-xs text-red-200">
                <Clock className="w-3 h-3 mr-1" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleEmergencyClick}
        disabled={isActive}
        className={`
          relative w-20 h-20 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden
          ${isActive 
            ? 'bg-red-600 animate-pulse scale-110' 
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95'
          }
        `}
        title="Bouton d'urgence SOS"
      >
        {/* Ripple effect */}
        {!isActive && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
            <div className="absolute inset-2 rounded-full bg-red-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 text-white mb-1" />
          <span className="text-xs font-bold text-white">SOS</span>
        </div>
      </motion.button>
    </div>
  );
};

export default EmergencyButton;