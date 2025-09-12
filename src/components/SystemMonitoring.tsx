import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, AlertTriangle, CheckCircle, Clock, Wifi, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const SystemMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable' },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', trend: 'up' },
    { name: 'Disk Usage', value: 23, unit: '%', status: 'good', trend: 'stable' },
    { name: 'Network I/O', value: 156, unit: 'MB/s', status: 'good', trend: 'down' },
    { name: 'Active Users', value: 42, unit: '', status: 'good', trend: 'up' },
    { name: 'Database Connections', value: 18, unit: '', status: 'good', trend: 'stable' }
  ]);

  const [systemStatus] = useState({
    overall: 'operational',
    api: 'operational',
    database: 'operational',
    websockets: 'operational',
    geolocation: 'operational'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Administrateur Requis</h2>
          <p className="text-gray-600">Cette section est réservée aux administrateurs système.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Système</h1>
        <p className="text-gray-600">Surveillance en temps réel de la plateforme Pirogue Connect</p>
      </div>

      {/* System Status Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          État du Système
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(systemStatus).map(([service, status]) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {service === 'api' ? 'API' : 
                   service === 'database' ? 'Base de données' :
                   service === 'websockets' ? 'WebSockets' :
                   service === 'geolocation' ? 'Géolocalisation' : 'Général'}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Opérationnel
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600">{metric.name}</h4>
              <span className="text-lg">{getTrendIcon(metric.trend)}</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl font-bold ${getMetricColor(metric.status)}`}>
                  {metric.value.toFixed(metric.name.includes('Usage') ? 0 : 1)}
                  <span className="text-sm font-normal ml-1">{metric.unit}</span>
                </p>
              </div>
              
              <div className="w-16 h-8 bg-gray-100 rounded">
                <div 
                  className={`h-full rounded transition-all duration-500 ${
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, metric.value)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Activité Récente
          </h3>
          
          <div className="space-y-4">
            {[
              { time: '14:32', event: 'Nouvelle connexion utilisateur', user: 'amadou@example.com', type: 'info' },
              { time: '14:28', event: 'Alerte d\'urgence créée', user: 'Système', type: 'warning' },
              { time: '14:25', event: 'Sauvegarde automatique terminée', user: 'Système', type: 'success' },
              { time: '14:20', event: 'Mise à jour de position GPS', user: 'fatou@gie-cayar.sn', type: 'info' },
              { time: '14:15', event: 'Nouveau message dans le canal général', user: 'amadou@example.com', type: 'info' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Ressources Système
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <HardDrive className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Stockage</p>
                  <p className="text-xs text-gray-500">2.1 GB utilisés / 10 GB</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">21%</p>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/5 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Base de données</p>
                  <p className="text-xs text-gray-500">18 connexions actives</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">Optimal</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Réseau</p>
                  <p className="text-xs text-gray-500">156 MB/s trafic</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">Stable</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Utilisateurs</p>
                  <p className="text-xs text-gray-500">42 connectés</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">+8 vs hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;