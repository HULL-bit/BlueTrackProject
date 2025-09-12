import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  User, 
  FileText,
  Search,
  Filter,
  Eye,
  Navigation,
  Battery,
  Signal,
  Wifi,
  WifiOff,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import PirogueForm from './PirogueForm';
import { pirogueImages, imageUtils } from '../assets/images';

interface Pirogue {
  id: string;
  name: string;
  owner: string;
  phone: string;
  licenseNumber?: string;
  location: string;
  description?: string;
  imageUrl: string;
  deviceId?: string;
  isActive: boolean;
  lastPosition?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  createdAt: string;
}

const PirogueManagement: React.FC = () => {
  const { user } = useAuth();
  const { users, trackerDevices, locations } = useData();
  const [pirogues, setPirogues] = useState<Pirogue[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPirogue, setEditingPirogue] = useState<Pirogue | null>(null);
  const [selectedPirogue, setSelectedPirogue] = useState<Pirogue | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Simuler des données de pirogues basées sur les utilisateurs
  useEffect(() => {
    const simulatedPirogues: Pirogue[] = users.map((user, index) => {
      const randomImage = pirogueImages[index % pirogueImages.length];
      const device = trackerDevices.find(d => d.userId === user.id);
      const location = locations.find(l => l.userId === user.id);
      
      return {
        id: user.id,
        name: user.profile?.boatName || `Pirogue ${index + 1}`,
        owner: user.profile?.fullName || user.email,
        phone: user.profile?.phone || '+221 XX XXX XXXX',
        licenseNumber: user.profile?.licenseNumber,
        location: 'Cayar', // Par défaut
        description: `Pirogue artisanale de ${user.profile?.fullName || 'pêche'}`,
        imageUrl: randomImage.url,
        deviceId: device?.deviceId,
        isActive: device?.isActive || false,
        lastPosition: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        } : undefined,
        createdAt: new Date().toISOString()
      };
    });

    setPirogues(simulatedPirogues);
  }, [users, trackerDevices, locations]);

  const filteredPirogues = pirogues.filter(pirogue => {
    const matchesSearch = 
      pirogue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pirogue.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pirogue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation === 'all' || pirogue.location === filterLocation;
    
    return matchesSearch && matchesLocation;
  });

  const handleSavePirogue = async (formData: any) => {
    try {
      setIsLoading(true);
      
      if (editingPirogue) {
        // Mise à jour
        setPirogues(prev => prev.map(p => 
          p.id === editingPirogue.id 
            ? { ...p, ...formData, imageUrl: formData.selectedImageUrl }
            : p
        ));
      } else {
        // Ajout
        const newPirogue: Pirogue = {
          id: Date.now().toString(),
          ...formData,
          imageUrl: formData.selectedImageUrl,
          isActive: false,
          createdAt: new Date().toISOString()
        };
        setPirogues(prev => [newPirogue, ...prev]);
      }
      
      setEditingPirogue(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur sauvegarde pirogue:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePirogue = async (pirogueId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pirogue ?')) {
      setPirogues(prev => prev.filter(p => p.id !== pirogueId));
    }
  };

  const getStatusColor = (pirogue: Pirogue) => {
    if (!pirogue.isActive) return 'bg-red-100 text-red-800';
    if (!pirogue.lastPosition) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (pirogue: Pirogue) => {
    if (!pirogue.isActive) return 'Hors ligne';
    if (!pirogue.lastPosition) return 'Pas de position';
    return 'En ligne';
  };

  const getStatusIcon = (pirogue: Pirogue) => {
    if (!pirogue.isActive) return <WifiOff className="w-4 h-4" />;
    if (!pirogue.lastPosition) return <AlertTriangle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const uniqueLocations = [...new Set(pirogues.map(p => p.location))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gestion des Pirogues
          </h1>
          <p className="text-slate-600 mt-1">
            Administration des pirogues artisanales sénégalaises
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter Pirogue</span>
        </motion.button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card hover-glow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Pirogues</p>
                <p className="text-3xl font-bold text-blue-600">{pirogues.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Ship className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card hover-glow-secondary"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">En Ligne</p>
                <p className="text-3xl font-bold text-green-600">
                  {pirogues.filter(p => p.isActive && p.lastPosition).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card hover-glow-accent"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avec GPS</p>
                <p className="text-3xl font-bold text-purple-600">
                  {pirogues.filter(p => p.deviceId).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Navigation className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Localisations</p>
                <p className="text-3xl font-bold text-orange-600">{uniqueLocations.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une pirogue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">Toutes les localisations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des pirogues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPirogues.map((pirogue, index) => (
          <motion.div
            key={pirogue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover-glow overflow-hidden"
          >
            <div className="relative">
              <img
                src={pirogue.imageUrl}
                alt={pirogue.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pirogue)} flex items-center space-x-1`}>
                  {getStatusIcon(pirogue)}
                  <span>{getStatusText(pirogue)}</span>
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{pirogue.name}</h3>
                  <p className="text-sm text-gray-600">{pirogue.owner}</p>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPirogue(pirogue);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-300"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingPirogue(pirogue);
                      setShowAddForm(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeletePirogue(pirogue.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{pirogue.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{pirogue.phone}</span>
                </div>
                {pirogue.licenseNumber && (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{pirogue.licenseNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Ajoutée le {formatDate(pirogue.createdAt)}</span>
                </div>
              </div>
              
              {pirogue.deviceId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dispositif GPS:</span>
                    <span className="font-medium text-blue-600">{pirogue.deviceId}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPirogues.length === 0 && (
        <div className="text-center py-12">
          <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune pirogue trouvée</h3>
          <p className="text-gray-600">Commencez par ajouter une pirogue artisanale</p>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      <PirogueForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingPirogue(null);
        }}
        onSave={handleSavePirogue}
        editingPirogue={editingPirogue}
      />

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedPirogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails de la Pirogue</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedPirogue.imageUrl}
                      alt={selectedPirogue.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedPirogue.name}</h3>
                      <p className="text-gray-600">Propriétaire: {selectedPirogue.owner}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localisation:</span>
                        <span className="font-medium">{selectedPirogue.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium">{selectedPirogue.phone}</span>
                      </div>
                      {selectedPirogue.licenseNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Licence:</span>
                          <span className="font-medium">{selectedPirogue.licenseNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`font-medium ${getStatusColor(selectedPirogue)} px-2 py-1 rounded-full text-xs`}>
                          {getStatusText(selectedPirogue)}
                        </span>
                      </div>
                    </div>
                    
                    {selectedPirogue.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm">{selectedPirogue.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PirogueManagement;