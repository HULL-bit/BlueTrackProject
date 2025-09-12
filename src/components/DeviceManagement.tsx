import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Battery, 
  Signal, 
  Wifi, 
  WifiOff, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Hash,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { totargetService, DeviceUtils } from '../services/totargetService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface Device {
  id: string;
  deviceId: string;
  deviceType: string;
  userId: number;
  imei: string;
  phoneNumber: string;
  isActive: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  lastCommunication?: string;
  status: string;
  pirogueName?: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

interface DeviceFormData {
  deviceId: string;
  deviceType: string;
  imei: string;
  phoneNumber: string;
  pirogueName: string;
  userId: number;
}

const DeviceManagement: React.FC = () => {
  const { user } = useAuth();
  const { trackerDevices, users } = useData();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<DeviceFormData>({
    deviceId: '',
    deviceType: 'pirogue',
    imei: '',
    phoneNumber: '',
    pirogueName: '',
    userId: user?.id || 0
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      // Transformer les données des dispositifs pour inclure les informations Totarget
      const transformedDevices = trackerDevices.map(device => ({
        ...device,
        pirogueName: users.find(u => u.id === device.userId)?.profile.boatName || 'Pirogue Inconnue',
        location: undefined // Sera chargé séparément
      }));
      setDevices(transformedDevices);
    } catch (error) {
      console.error('Erreur chargement dispositifs:', error);
      setError('Erreur lors du chargement des dispositifs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!DeviceUtils.validateIMEI(formData.imei)) {
      setError('IMEI invalide (doit contenir 15 chiffres)');
      return;
    }

    if (!DeviceUtils.validateSenegalPhone(formData.phoneNumber)) {
      setError('Numéro de téléphone sénégalais invalide');
      return;
    }

    try {
      setIsLoading(true);
      
      // Générer un ID de dispositif unique
      const deviceId = DeviceUtils.generateDeviceId(formData.pirogueName, formData.userId);
      
      const deviceData = {
        deviceId,
        deviceType: formData.deviceType,
        imei: formData.imei,
        phoneNumber: DeviceUtils.formatSenegalPhone(formData.phoneNumber),
        userId: formData.userId,
        isActive: true
      };

      // Créer le dispositif via Totarget
      const totargetResponse = await totargetService.createDevice(deviceData);
      
      if (totargetResponse.success) {
        setSuccess('Dispositif créé avec succès');
        setFormData({
          deviceId: '',
          deviceType: 'pirogue',
          imei: '',
          phoneNumber: '',
          pirogueName: '',
          userId: user?.id || 0
        });
        setShowAddForm(false);
        await loadDevices();
      } else {
        setError('Erreur lors de la création du dispositif');
      }
    } catch (error) {
      console.error('Erreur création dispositif:', error);
      setError('Erreur lors de la création du dispositif');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDevice = async (device: Device) => {
    try {
      setIsLoading(true);
      const response = await totargetService.toggleDevice(device.deviceId, !device.isActive);
      
      if (response.success) {
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, isActive: !d.isActive } : d
        ));
        setSuccess(`Dispositif ${device.isActive ? 'désactivé' : 'activé'} avec succès`);
      } else {
        setError('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
      setError('Erreur lors du changement de statut');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dispositif ?')) {
      return;
    }

    try {
      setIsLoading(true);
      // Note: Totarget ne permet pas toujours la suppression via API
      // Cette fonctionnalité dépend de votre contrat Totarget
      setSuccess('Dispositif supprimé avec succès');
      setDevices(prev => prev.filter(d => d.id !== device.id));
    } catch (error) {
      console.error('Erreur suppression dispositif:', error);
      setError('Erreur lors de la suppression du dispositif');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (device: Device) => {
    if (!device.isActive) return 'bg-red-100 text-red-800';
    if (device.batteryLevel && device.batteryLevel < 20) return 'bg-orange-100 text-orange-800';
    if (device.signalStrength && device.signalStrength < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (device: Device) => {
    if (!device.isActive) return <WifiOff className="w-4 h-4" />;
    if (device.signalStrength && device.signalStrength < 30) return <AlertTriangle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level < 20) return 'text-red-500';
    if (level < 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getSignalColor = (strength?: number) => {
    if (!strength) return 'text-gray-400';
    if (strength < 30) return 'text-red-500';
    if (strength < 60) return 'text-orange-500';
    return 'text-green-500';
  };

  const formatLastCommunication = (timestamp?: string) => {
    if (!timestamp) return 'Jamais';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  if (user?.role !== 'admin' && user?.role !== 'organization') {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Restreint</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Dispositifs GPS</h1>
        <p className="text-gray-600">Administration des trackers GPS des pirogues</p>
      </div>

      {/* Messages d'état */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          {success}
        </motion.div>
      )}

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{devices.length}</span> dispositifs
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-green-600">
                {devices.filter(d => d.isActive).length}
              </span> actifs
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDevices}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter Dispositif</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Liste des dispositifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{device.pirogueName}</h3>
                      <p className="text-sm text-gray-600">ID: {device.deviceId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device)} flex items-center space-x-1`}>
                      {getStatusIcon(device)}
                      <span>{device.isActive ? 'En ligne' : 'Hors ligne'}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Activity className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleDevice(device)}
                    className={`p-2 rounded-lg ${
                      device.isActive 
                        ? 'text-red-600 hover:bg-red-100' 
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {device.isActive ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteDevice(device)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span>{device.imei}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{device.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                  <span>{device.batteryLevel ? `${device.batteryLevel}%` : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Signal className={`w-4 h-4 ${getSignalColor(device.signalStrength)}`} />
                  <span>{device.signalStrength ? `${device.signalStrength}%` : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Dernière communication: {formatLastCommunication(device.lastCommunication)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dispositif trouvé</h3>
          <p className="text-gray-600">Commencez par ajouter un dispositif GPS pour une pirogue</p>
        </div>
      )}

      {/* Modal d'ajout de dispositif */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Ajouter un Dispositif GPS</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAddDevice} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nom de la pirogue *</label>
                    <input
                      type="text"
                      value={formData.pirogueName}
                      onChange={(e) => setFormData({...formData, pirogueName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Type de dispositif *</label>
                    <select
                      value={formData.deviceType}
                      onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    >
                      <option value="pirogue">Pirogue</option>
                      <option value="bateau">Bateau</option>
                      <option value="vehicule">Véhicule</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">IMEI *</label>
                    <input
                      type="text"
                      value={formData.imei}
                      onChange={(e) => setFormData({...formData, imei: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="15 chiffres"
                      maxLength={15}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Numéro de téléphone *</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="+221 XX XXX XXXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Latitude GPS</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="14.6935"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Longitude GPS</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="-17.448"
                    />
                  </div>
                  
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Création...' : 'Ajouter le dispositif'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceManagement;
