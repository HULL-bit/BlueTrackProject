import React, { useState } from 'react';
import { Clock, MapPin, Ship, TrendingUp, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const TripHistory: React.FC = () => {
  const { user } = useAuth();
  const { trips } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTrip, setSelectedTrip] = useState<{
    id: string;
    startTime: string;
    endTime?: string;
    distance?: number;
    maxSpeed?: number;
    avgSpeed?: number;
    status?: string;
  } | null>(null);

  const userTrips = trips.filter(trip => trip.userId === user?.id);

  const getStatistics = () => {
    const totalTrips = userTrips.length;
    const totalDistance = userTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalTime = userTrips.reduce((sum, trip) => {
      if (trip.endTime) {
        const start = new Date(trip.startTime);
        const end = new Date(trip.endTime);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      }
      return sum;
    }, 0);
    const avgSpeed = userTrips.reduce((sum, trip) => sum + (trip.avgSpeed || 0), 0) / totalTrips || 0;

    return { totalTrips, totalDistance, totalTime, avgSpeed };
  };

  const stats = getStatistics();

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique des Sorties</h1>
        <p className="text-gray-600">Consultez vos sorties de pêche et statistiques</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sorties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
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
              <p className="text-sm font-medium text-gray-600">Distance Totale</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toFixed(1)} km</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Temps Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTime.toFixed(1)}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Vitesse Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSpeed.toFixed(1)} kt</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
              <option value="all">Toutes les sorties</option>
            </select>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sorties Récentes</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {userTrips.length === 0 ? (
            <div className="p-12 text-center">
              <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune sortie enregistrée</h3>
              <p className="text-gray-600">Vos sorties de pêche apparaîtront ici automatiquement</p>
            </div>
          ) : (
            userTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Ship className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Sortie du {new Date(trip.startTime).toLocaleDateString('fr-FR')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {trip.endTime && (
                            <> - {new Date(trip.endTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Durée:</span>
                        <span className="ml-2 font-medium">{formatDuration(trip.startTime, trip.endTime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Distance:</span>
                        <span className="ml-2 font-medium">{trip.distance?.toFixed(1) || 0} km</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vitesse max:</span>
                        <span className="ml-2 font-medium">{trip.maxSpeed?.toFixed(1) || 0} kt</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Statut:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          trip.endTime 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trip.endTime ? 'Terminée' : 'En cours'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails de la sortie
                </h3>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informations générales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{new Date(selectedTrip.startTime).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure de départ:</span>
                        <span>{new Date(selectedTrip.startTime).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      {selectedTrip.endTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heure de retour:</span>
                          <span>{new Date(selectedTrip.endTime).toLocaleTimeString('fr-FR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée:</span>
                        <span>{formatDuration(selectedTrip.startTime, selectedTrip.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span>{selectedTrip.distance?.toFixed(1) || 0} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vitesse moyenne:</span>
                        <span>{selectedTrip.avgSpeed?.toFixed(1) || 0} kt</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vitesse maximale:</span>
                        <span>{selectedTrip.maxSpeed?.toFixed(1) || 0} kt</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedTrip.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTrip.notes}</p>
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

export default TripHistory;