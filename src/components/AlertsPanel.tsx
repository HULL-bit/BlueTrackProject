import React from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Bell, Shield, CloudRain, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { Alert } from '../types';

const AlertsPanel: React.FC = () => {
  const { alerts, acknowledgeAlert } = useData();

  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': 
        return {
          color: 'bg-red-500 text-white',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          pulseColor: 'bg-red-400'
        };
      case 'high': 
        return {
          color: 'bg-orange-500 text-white',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          pulseColor: 'bg-orange-400'
        };
      case 'medium': 
        return {
          color: 'bg-yellow-500 text-white',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          pulseColor: 'bg-yellow-400'
        };
      case 'low': 
        return {
          color: 'bg-blue-500 text-white',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          pulseColor: 'bg-blue-400'
        };
      default: 
        return {
          color: 'bg-gray-500 text-white',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          pulseColor: 'bg-gray-400'
        };
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'acknowledged': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeConfig = (type: Alert['type']) => {
    switch (type) {
      case 'emergency': 
        return {
          label: 'URGENCE',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'zone_violation': 
        return {
          label: 'ZONE',
          icon: Shield,
          color: 'text-orange-600'
        };
      case 'weather': 
        return {
          label: 'MÉTÉO',
          icon: CloudRain,
          color: 'text-blue-600'
        };
      case 'system': 
        return {
          label: 'SYSTÈME',
          icon: Settings,
          color: 'text-purple-600'
        };
      default: 
        return {
          label: 'ALERTE',
          icon: Bell,
          color: 'text-gray-600'
        };
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const otherAlerts = alerts.filter(alert => alert.status !== 'active').slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-500" />
            Alertes & Notifications
          </h3>
          {activeAlerts.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">
                {activeAlerts.length} active{activeAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activeAlerts.length === 0 && otherAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-gray-700 mb-2">Aucune alerte active</p>
              <p className="text-sm">Toutes les opérations sont normales</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Active alerts */}
              {activeAlerts.map((alert, index) => {
                const severityConfig = getSeverityConfig(alert.severity);
                const typeConfig = getTypeConfig(alert.type);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 hover:${severityConfig.bgColor} transition-all duration-300 ${severityConfig.borderColor} border-l-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityConfig.color} flex items-center space-x-1`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeConfig.label}</span>
                          </span>
                          
                          <div className={`flex items-center ${typeConfig.color}`}>
                            {getStatusIcon(alert.status)}
                            {alert.severity === 'critical' && (
                              <div className={`w-2 h-2 ${severityConfig.pulseColor} rounded-full animate-pulse ml-2`}></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-900 font-semibold mb-2">{alert.message}</p>
                        
                        {alert.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>
                              {typeof alert.location.latitude === 'number' ? alert.location.latitude.toFixed(4) : (parseFloat(alert.location.latitude) || 0).toFixed(4)}, {typeof alert.location.longitude === 'number' ? alert.location.longitude.toFixed(4) : (parseFloat(alert.location.longitude) || 0).toFixed(4)}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-4 p-2 rounded-full hover:bg-green-100 transition-colors group"
                        title="Acquitter l'alerte"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Recent alerts */}
              {otherAlerts.map((alert, index) => {
                const severityConfig = getSeverityConfig(alert.severity);
                const typeConfig = getTypeConfig(alert.type);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (activeAlerts.length + index) * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig.color} opacity-75 flex items-center space-x-1`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeConfig.label}</span>
                          </span>
                          <div className="flex items-center text-gray-500">
                            {getStatusIcon(alert.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-1">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;