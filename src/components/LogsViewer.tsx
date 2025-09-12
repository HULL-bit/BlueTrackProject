import React, { useState } from 'react';
import { Download, FileText, Calendar, Search, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '../lib/logger';
import { useAuth } from '../contexts/AuthContext';

const LogsViewer: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'message' | 'alert'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Administrateur Requis</h2>
          <p className="text-gray-600">Cette section est réservée aux administrateurs système.</p>
        </div>
      </div>
    );
  }

  // Récupérer tous les logs depuis localStorage
  const getAllLogs = () => {
    try {
      const logs = localStorage.getItem('pirogue_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Erreur lecture logs:', error);
      return [];
    }
  };

  const logs = getAllLogs();

  // Filtrer les logs
  const filteredLogs = logs.filter((log: {
    type: string;
    content: { content?: string; message?: string };
    timestamp: string;
  }) => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = !searchTerm || 
      log.content.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.content.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || 
      new Date(log.timestamp).toISOString().split('T')[0] === dateFilter;
    
    return matchesType && matchesSearch && matchesDate;
  });

  const handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  const handleClearOldLogs = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer les logs de plus de 30 jours ?')) {
      // Cette fonction est déjà automatique dans le logger
      alert('Les logs anciens sont automatiquement nettoyés');
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'alert': return '🚨';
      default: return '📄';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Logs</h1>
        <p className="text-gray-600">Consultation et gestion des logs système</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-blue-600">
                {logs.filter((log: any) => log.type === 'message').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertes</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter((log: any) => log.type === 'alert').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🚨</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter((log: any) => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="message">Messages</option>
              <option value="alert">Alertes</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearOldLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Nettoyer</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Logs Système ({filteredLogs.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun log trouvé</h3>
              <p className="text-gray-600">Aucun log ne correspond aux critères de recherche</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log: any, index: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getLogTypeIcon(log.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-900 mb-2">
                        {log.type === 'message' ? (
                          <div>
                            <strong>Canal:</strong> {log.content.channelId || 'Général'} - 
                            <strong> Contenu:</strong> {log.content.content}
                          </div>
                        ) : (
                          <div>
                            <strong>Type:</strong> {log.content.type} - 
                            <strong> Message:</strong> {log.content.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <strong>Utilisateur:</strong> {log.userId}
                        {log.metadata && (
                          <span className="ml-4">
                            <strong>Métadonnées:</strong> {JSON.stringify(log.metadata)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;