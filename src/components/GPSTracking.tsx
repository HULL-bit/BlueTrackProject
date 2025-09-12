import React, { useState, useEffect, useCallback } from 'react';
import { 
  Satellite, 
  MapPin, 
  Activity, 
  Battery, 
  Signal, 
  Clock, 
  Ship, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw,
  Navigation,
  Compass,
  Wind,
  Waves,
  Anchor,
  Eye,
  EyeOff,
  Layers,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Download,
  Share2,
  Globe,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { trackingAPI, totargetAPI } from '../lib/djangoApi';
import { TrackerDevice } from '../types';
import MarineMap from './MarineMap';

const GPSTracking: React.FC = () => {
  const { user } = useAuth();
  const { locations, updateLocation } = useData();

  // Vérifier les permissions d'accès
  const hasAccess = user?.role === 'admin' || user?.role === 'organization';
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Satellite className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Restreint</h2>
          <p className="text-gray-600 mb-6">
            Cette fonctionnalité est réservée aux administrateurs et organisations. 
            Les pêcheurs n'ont pas accès au suivi GPS des pirogues.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Votre rôle :</strong> {user?.role === 'fisherman' ? 'Pêcheur' : user?.role}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Contactez un administrateur pour plus d'informations.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const [trackerDevices, setTrackerDevices] = useState<TrackerDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<TrackerDevice | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadTrackerDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await trackingAPI.getDevices();
      const devices = response?.results || response || [];
      
      // Transformer les données pour correspondre à notre interface
      const transformedDevices: TrackerDevice[] = devices.map((device: {
        id: string;
        device_id: string;
        device_type: string;
        user: string;
        imei: string;
        phone_number: string;
        is_active: boolean;
        last_communication: string;
        battery_level: number;
        signal_strength: number;
      }) => ({
        id: device.id,
        deviceId: device.device_id,
        deviceType: device.device_type as 'gps_tracker' | 'smartphone' | 'satellite',
        userId: device.user,
        imei: device.imei,
        phoneNumber: device.phone_number,
        isActive: device.is_active,
        lastCommunication: device.last_communication,
        batteryLevel: device.battery_level,
        signalStrength: device.signal_strength,
        status: device.is_active ? 'En ligne' : 'Hors ligne'
      }));
      
      setTrackerDevices(transformedDevices);
      
      if (transformedDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(transformedDevices[0]);
      }
    } catch (error) {
      console.error('Erreur chargement dispositifs:', error);
      // Pas de fallback avec des données simulées - afficher un message d'erreur
      setTrackerDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Géolocalisation non supportée');
      return;
    }

    setIsTracking(true);

    const trackLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            userId: user!.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            altitude: position.coords.altitude || 0,
            accuracy: position.coords.accuracy || 0
          };

          await updateLocation(locationData);
          setLastUpdate(new Date());
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    };

    // Première localisation immédiate
    trackLocation();

    // Puis toutes les X secondes
    const interval = setInterval(trackLocation, trackingInterval * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id, trackingInterval, updateLocation]);

  useEffect(() => {
    loadTrackerDevices();
    // Ne pas démarrer automatiquement le tracking GPS
    // startLocationTracking();
  }, [loadTrackerDevices]);

  const handleDeviceCommand = async (command: string) => {
    if (!selectedDevice) return;

    try {
      let result;
      
      switch (command) {
        case 'requestLocation':
          result = await totargetAPI.requestLocation(selectedDevice.deviceId);
          break;
        case 'seal': {
          const sealKey = prompt('Entrez la clé de scellement (6 chiffres):');
          if (sealKey) {
            result = await totargetAPI.sealDevice(selectedDevice.deviceId, selectedDevice.deviceId, sealKey);
          }
          break;
        }
        case 'unseal': {
          const unsealKey = prompt('Entrez la clé de descellement (6 chiffres):');
          if (unsealKey) {
            result = await totargetAPI.unsealDevice(selectedDevice.deviceId, selectedDevice.deviceId, unsealKey);
          }
          break;
        }
        case 'setInterval':
          result = await totargetAPI.setLocationInterval(selectedDevice.deviceId, trackingInterval);
          break;
        default:
          console.warn('Commande inconnue:', command);
          break;
      }

      if (result) {
        console.log('Commande envoyée avec succès:', result);
        // Actualiser les dispositifs
        await loadTrackerDevices();
      }
    } catch (error) {
      console.error('Erreur envoi commande:', error);
      alert('Erreur lors de l\'envoi de la commande');
    }
  };

  const getDeviceStatusColor = (device: TrackerDevice) => {
    if (!device.isActive) return 'text-red-600 bg-red-100';
    if (device.batteryLevel && device.batteryLevel < 20) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getSignalBars = (strength?: number) => {
    if (!strength) return 0;
    return Math.min(5, Math.max(1, strength));
  };

  const filteredDevices = trackerDevices.filter(device => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.deviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'online' && device.isActive) ||
                         (filterStatus === 'offline' && !device.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleDeviceSelect = (device: TrackerDevice) => {
    setSelectedDevice(device);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'p-6 bg-gray-50 min-h-full'}`}>
      {/* Header flexible */}
      <div className={`${isFullscreen ? 'p-4 border-b border-gray-200' : 'mb-6'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
              Tracking GPS Marine
            </h1>
            <p className="text-gray-600">Surveillance en temps réel des dispositifs GPS</p>
            <p className="text-xs text-gray-500 mt-1">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un dispositif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isTracking) {
                  setIsTracking(false);
                } else {
                  startLocationTracking();
                }
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isTracking
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isTracking ? '🛑 Arrêter GPS' : '📍 Démarrer GPS'}
            </button>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'list', icon: '≡', label: 'Liste' },
                { id: 'grid', icon: '⊞', label: 'Grille' },
                { id: 'map', icon: '🗺', label: 'Carte' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques des dispositifs - Toujours visibles */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 ${viewMode === 'map' ? 'relative z-40' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dispositifs Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {trackerDevices.filter(d => d.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Satellite className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Dispositifs</p>
              <p className="text-2xl font-bold text-primary-600">{trackerDevices.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-primary-600" />
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
              <p className="text-sm font-medium text-gray-600">Positions Reçues</p>
              <p className="text-2xl font-bold text-purple-600">{locations.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Tracking</p>
              <p className={`text-2xl font-bold ${isTracking ? 'text-green-600' : 'text-gray-600'}`}>
                {isTracking ? 'ACTIF' : 'ARRÊTÉ'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isTracking ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Activity className={`w-6 h-6 ${isTracking ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contenu principal flexible */}
      <div className={`grid ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
        {/* Vue Carte Marine */}
        {viewMode === 'map' && (
          <div className="w-full">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Carte Marine</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadTrackerDevices}
                  className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de la carte marine...</p>
              </div>
            ) : trackerDevices.length === 0 ? (
              <div className="p-12 text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dispositif</h3>
                <p className="text-gray-600">Aucun dispositif GPS configuré</p>
                <p className="text-sm text-gray-500 mt-2">Les données réelles s'afficheront ici</p>
              </div>
            ) : (
              <div className="h-[calc(100vh-400px)]">
                <MarineMap
                  devices={filteredDevices}
                  locations={locations}
                  selectedDevice={selectedDevice}
                  onDeviceSelect={handleDeviceSelect}
                  isFullscreen={isFullscreen}
                />
              </div>
            )}
          </div>
        )}

        {/* Liste des dispositifs */}
        {viewMode !== 'map' && (
          <div className={`${viewMode === 'list' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Dispositifs GPS</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadTrackerDevices}
                    className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className={`${viewMode === 'list' ? 'max-h-96' : 'max-h-screen'} overflow-y-auto`}>
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des dispositifs...</p>
                  </div>
                ) : filteredDevices.length === 0 ? (
                  <div className="p-6 text-center">
                    <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dispositif trouvé</h3>
                    <p className="text-gray-600">Aucun dispositif ne correspond à vos critères</p>
                  </div>
                ) : (
                  <div className={viewMode === 'list' ? 'divide-y divide-gray-200' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'}>
                    {filteredDevices.map((device, index) => (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedDevice(device)}
                        className={`${viewMode === 'list' ? 'p-4' : 'p-4 border border-gray-200 rounded-lg'} cursor-pointer transition-all duration-300 ${
                          selectedDevice?.id === device.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              device.isActive ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <Satellite className={`w-5 h-5 ${
                                device.isActive ? 'text-green-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{device.deviceId}</h4>
                              <p className="text-xs text-gray-600 capitalize">{device.deviceType.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device)}`}>
                            {device.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <Battery className="w-3 h-3 text-gray-400" />
                            <span>{device.batteryLevel || 0}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Signal className="w-3 h-3 text-gray-400" />
                            <div className="flex space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-3 rounded-full ${
                                    i < getSignalBars(device.signalStrength) ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {device.lastCommunication && (
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              {new Date(device.lastCommunication).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panneau de contrôle et détails */}
        {viewMode !== 'map' && (
          <div className={`${viewMode === 'list' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {selectedDevice ? (
              <>
                {/* Informations du dispositif sélectionné */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        selectedDevice.isActive ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Satellite className={`w-8 h-8 ${
                          selectedDevice.isActive ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedDevice.deviceId}</h3>
                        <p className="text-gray-600 capitalize">{selectedDevice.deviceType.replace('_', ' ')}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDeviceStatusColor(selectedDevice)}`}>
                          {selectedDevice.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Battery className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{selectedDevice.batteryLevel || 0}%</span>
                          <div className="w-8 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                (selectedDevice.batteryLevel || 0) > 50 ? 'bg-green-500' :
                                (selectedDevice.batteryLevel || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedDevice.batteryLevel || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Signal className="w-4 h-4 text-gray-400" />
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-4 rounded-full ${
                                i < getSignalBars(selectedDevice.signalStrength) ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{selectedDevice.signalStrength || 0}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Informations Techniques</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Dispositif:</span>
                          <span className="font-mono">{selectedDevice.deviceId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="capitalize">{selectedDevice.deviceType.replace('_', ' ')}</span>
                        </div>
                        {selectedDevice.imei && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">IMEI:</span>
                            <span className="font-mono">{selectedDevice.imei}</span>
                          </div>
                        )}
                        {selectedDevice.phoneNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Numéro:</span>
                            <span>{selectedDevice.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">État de Connexion</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className={`font-medium ${selectedDevice.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedDevice.isActive ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                        {selectedDevice.lastCommunication && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dernière comm.:</span>
                            <span>{new Date(selectedDevice.lastCommunication).toLocaleString('fr-FR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intervalle:</span>
                          <span>{trackingInterval}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contrôles du dispositif */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrôles du Dispositif</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceCommand('requestLocation')}
                      disabled={!selectedDevice.isActive}
                      className="flex flex-col items-center space-y-2 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-medium">Demander Position</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceCommand('seal')}
                      disabled={!selectedDevice.isActive}
                      className="flex flex-col items-center space-y-2 p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium">Sceller</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceCommand('unseal')}
                      disabled={!selectedDevice.isActive}
                      className="flex flex-col items-center space-y-2 p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Pause className="w-6 h-6 text-orange-600" />
                      <span className="text-sm font-medium">Desceller</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeviceCommand('setInterval')}
                      disabled={!selectedDevice.isActive}
                      className="flex flex-col items-center space-y-2 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Settings className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-medium">Configurer</span>
                    </motion.button>
                  </div>

                  {/* Configuration de l'intervalle */}
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalle de tracking (secondes)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={trackingInterval}
                        onChange={(e) => setTrackingInterval(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-900 min-w-12">
                        {trackingInterval}s
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10s</span>
                      <span>5min</span>
                    </div>
                  </div>
                </div>

                {/* Historique des positions récentes */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Positions Récentes</h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {locations
                      .filter(loc => selectedDevice && loc.userId === selectedDevice.userId)
                      .slice(0, 10)
                      .map((location, index) => (
                        <motion.div
                          key={location.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {typeof location.latitude === 'number' ? location.latitude.toFixed(6) : parseFloat(location.latitude).toFixed(6)}, {typeof location.longitude === 'number' ? location.longitude.toFixed(6) : parseFloat(location.longitude).toFixed(6)}
                              </p>
                              <p className="text-xs text-gray-600">
                                {location.speed ? (typeof location.speed === 'number' ? location.speed.toFixed(1) : parseFloat(location.speed).toFixed(1)) : '0.0'} km/h • {location.heading ? (typeof location.heading === 'number' ? location.heading.toFixed(0) : parseFloat(location.heading).toFixed(0)) : '0'}°
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(location.timestamp).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    
                    {locations.filter(loc => selectedDevice && loc.userId === selectedDevice.userId).length === 0 && (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Aucune position enregistrée</p>
                        <p className="text-sm text-gray-500 mt-1">Les données réelles s'afficheront ici</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un dispositif</h3>
                <p className="text-gray-600">Choisissez un dispositif GPS pour voir les détails et contrôles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSTracking;