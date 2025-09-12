import React, { useState } from 'react';
import { Ship, MapPin, Clock, TrendingUp, AlertTriangle, Users, Activity, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

// Interface pour définir le type de pirogue sélectionnée
interface SelectedPirogue {
  id: string;
  profile: { 
    fullName: string; 
    boatName?: string;
    phone?: string;
    licenseNumber?: string;
  };
  lastLocation?: { 
    latitude: number; 
    longitude: number; 
    speed?: number;
    timestamp: string;
  };
  currentTrip?: { 
    destination: string; 
    startTime: string; 
  };
  alerts: Array<{ 
    id: string;
    type: string; 
    message: string; 
    createdAt: string;
  }>;
  isActive: boolean;
  status: string;
}

const FleetManagement: React.FC = () => {
  const { user } = useAuth();
  const { locations, users, trips, alerts } = useData();
  const [selectedPirogue, setSelectedPirogue] = useState<SelectedPirogue | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculer les statistiques de la flotte
  const getFleetStatistics = () => {
    const activePirogues = new Set(
      locations
        .filter(loc => new Date(loc.timestamp) > new Date(Date.now() - 2 * 60 * 60 * 1000))
        .map(loc => loc.userId)
    ).size;

    const activeTrips = trips.filter(trip => !trip.endTime).length;
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const activeAlerts = alerts.filter(alert => alert.status === 'active').length;

    return {
      activePirogues,
      activeTrips,
      totalDistance: totalDistance.toFixed(1),
      activeAlerts,
      totalPirogues: users.filter(u => u.role === 'fisherman').length
    };
  };

  const stats = getFleetStatistics();

  // Obtenir les informations détaillées de chaque pirogue
  const getPirogueDetails = (): SelectedPirogue[] => {
    const fishermen = users.filter(u => u.role === 'fisherman');
    
    return fishermen.map(fisherman => {
      const lastLocation = locations
        .filter(loc => loc.userId === fisherman.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      const currentTrip = trips.find(trip => trip.userId === fisherman.id && !trip.endTime);
      const userAlerts = alerts.filter(alert => alert.userId === fisherman.id && alert.status === 'active');
      
      const isActive = lastLocation && 
        new Date(lastLocation.timestamp) > new Date(Date.now() - 2 * 60 * 60 * 1000);

      return {
        id: fisherman.id,
        profile: fisherman.profile || {
          fullName: fisherman.name || 'Nom inconnu',
          boatName: fisherman.boatName,
          phone: fisherman.phone,
          licenseNumber: fisherman.licenseNumber
        },
        lastLocation,
        currentTrip,
        alerts: userAlerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          message: alert.message,
          createdAt: alert.createdAt || alert.timestamp
        })),
        isActive: Boolean(isActive),
        status: currentTrip ? 'En sortie' : isActive ? 'Au port' : 'Hors ligne'
      };
    });
  };

  const pirogues = getPirogueDetails();
  const filteredPirogues = pirogues.filter(pirogue => {
    switch (filterStatus) {
      case 'active': return pirogue.isActive;
      case 'trip': return pirogue.currentTrip;
      case 'alert': return pirogue.alerts.length > 0;
      default: return true;
    }
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'En sortie': return 'bg-blue-100 text-blue-800';
      case 'Au port': return 'bg-green-100 text-green-800';
      case 'Hors ligne': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'organization' && user?.role !== 'admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Restreint</h2>
          <p className="text-gray-600">Cette section est réservée aux organisations et administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion de la Flotte</h1>
        <p className="text-gray-600">Surveillance et coordination des pirogues en temps réel</p>
      </div>

      {/* Statistiques de la flotte */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pirogues Actives</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activePirogues}</p>
              <p className="text-xs text-gray-500">sur {stats.totalPirogues}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Sorties en Cours</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeTrips}</p>
              <p className="text-xs text-gray-500">aujourd'hui</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Distance Totale</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDistance} km</p>
              <p className="text-xs text-gray-500">ce mois</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
              <p className="text-2xl font-bold text-red-600">{stats.activeAlerts}</p>
              <p className="text-xs text-gray-500">à traiter</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pêcheurs</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.totalPirogues}</p>
              <p className="text-xs text-gray-500">inscrits</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">État de la Flotte</h3>
            <p className="text-sm text-gray-600">{filteredPirogues.length} pirogues affichées</p>
          </div>
          
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'Toutes', count: pirogues.length },
              { id: 'active', label: 'Actives', count: pirogues.filter(p => p.isActive).length },
              { id: 'trip', label: 'En sortie', count: pirogues.filter(p => p.currentTrip).length },
              { id: 'alert', label: 'Alertes', count: pirogues.filter(p => p.alerts.length > 0).length }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === filter.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des pirogues */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pirogue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alertes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPirogues.map((pirogue, index) => (
                <motion.tr
                  key={pirogue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPirogue(pirogue)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Anchor className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pirogue.profile.boatName || 'Pirogue sans nom'}
                        </div>
                        <div className="text-sm text-gray-500">{pirogue.profile.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pirogue.status)}`}>
                      {pirogue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pirogue.lastLocation ? (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="font-mono text-xs">
                          {pirogue.lastLocation.latitude.toFixed(4)}, {pirogue.lastLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Position inconnue</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pirogue.lastLocation ? (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span>
                          {new Date(pirogue.lastLocation.timestamp).toLocaleString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pirogue.alerts.length > 0 ? (
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          {pirogue.alerts.length} alerte{pirogue.alerts.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-green-600">Aucune alerte</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPirogue(pirogue);
                      }}
                      className="text-cyan-600 hover:text-cyan-900"
                    >
                      Détails
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails de pirogue */}
      {selectedPirogue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails - {selectedPirogue.profile.boatName || 'Pirogue'}
                </h3>
                <button
                  onClick={() => setSelectedPirogue(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informations générales */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Informations Générales</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Pêcheur:</span>
                      <span className="ml-2 font-medium">{selectedPirogue.profile.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="ml-2 font-medium">{selectedPirogue.profile.phone || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Licence:</span>
                      <span className="ml-2 font-medium">{selectedPirogue.profile.licenseNumber || 'Non renseignée'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPirogue.status)}`}>
                        {selectedPirogue.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Position actuelle */}
                {selectedPirogue.lastLocation && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Position Actuelle</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Latitude:</span>
                        <span className="ml-2 font-mono">{selectedPirogue.lastLocation.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitude:</span>
                        <span className="ml-2 font-mono">{selectedPirogue.lastLocation.longitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vitesse:</span>
                        <span className="ml-2 font-medium">{selectedPirogue.lastLocation.speed?.toFixed(1) || 0} nœuds</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dernière mise à jour:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedPirogue.lastLocation.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sortie en cours */}
                {selectedPirogue.currentTrip && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Sortie en Cours</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Départ:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedPirogue.currentTrip.startTime).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Durée:</span>
                        <span className="ml-2 font-medium">
                          {Math.floor((Date.now() - new Date(selectedPirogue.currentTrip.startTime).getTime()) / (1000 * 60 * 60))}h
                          {Math.floor(((Date.now() - new Date(selectedPirogue.currentTrip.startTime).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alertes actives */}
                {selectedPirogue.alerts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Alertes Actives</h4>
                    <div className="space-y-2">
                      {selectedPirogue.alerts.map((alert) => (
                        <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-800">{alert.message}</span>
                            <span className="text-xs text-red-600">
                              {new Date(alert.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;