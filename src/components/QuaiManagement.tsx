import React, { useState, useEffect } from 'react';
import {
  Anchor,
  Calendar,
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  MapPin,
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Eye,
  Download,
  Filter,
  Navigation,
  Waves,
  Thermometer,
  Wind,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface Quai {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentVessels: string[];
  facilities: string[];
  maxVesselSize: number;
  depth: number;
  lastInspection: string;
  nextInspection: string;
  notes: string;
  weatherConditions?: {
    temperature: number;
    windSpeed: number;
    waveHeight: number;
    visibility: number;
  };
  tideInfo?: {
    currentTide: number;
    nextHighTide: string;
    nextLowTide: string;
  };
  occupancyRate?: number;
  dailyRevenue?: number;
  safetyRating?: number;
}

interface QuaiStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  reserved: number;
  totalRevenue: number;
  averageOccupancy: number;
}

interface Vessel {
  id: string;
  name: string;
  type: 'pirogue' | 'chalutier' | 'cargo' | 'passenger';
  size: number;
  arrivalTime: string;
  departureTime?: string;
  captain: string;
  status: 'docked' | 'loading' | 'unloading' | 'ready';
}

const QuaiManagement: React.FC = () => {
  const { user } = useAuth();
  const [quais, setQuais] = useState<Quai[]>([]);
  const [filteredQuais, setFilteredQuais] = useState<Quai[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuai, setEditingQuai] = useState<Quai | null>(null);
  const [selectedQuai, setSelectedQuai] = useState<Quai | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<QuaiStats>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    reserved: 0,
    totalRevenue: 0,
    averageOccupancy: 0
  });

  const [vessels, setVessels] = useState<Vessel[]>([
    {
      id: '1',
      name: 'Pirogue de la Paix',
      type: 'pirogue',
      size: 15,
      arrivalTime: '2024-09-01T08:00:00',
      captain: 'Moussa Diop',
      status: 'docked'
    },
    {
      id: '2',
      name: 'Espoir des Mers',
      type: 'pirogue',
      size: 12,
      arrivalTime: '2024-09-01T06:30:00',
      captain: 'Awa Ndiaye',
      status: 'loading'
    },
    {
      id: '3',
      name: 'Chalutier Atlantique',
      type: 'chalutier',
      size: 45,
      arrivalTime: '2024-08-31T22:00:00',
      captain: 'Ibrahima Sall',
      status: 'unloading'
    }
  ]);

  useEffect(() => {
    loadQuais();
  }, []);

  useEffect(() => {
    filterQuais();
    updateStats();
  }, [quais, searchTerm, statusFilter]);

  const loadQuais = async () => {
    // Simulation de chargement des quais avec données enrichies
    const mockQuais: Quai[] = [
      {
        id: '1',
        name: 'Quai Principal',
        location: 'Port de Dakar',
        coordinates: [14.7167, -17.4677],
        capacity: 5,
        status: 'available',
        currentVessels: ['Pirogue de la Paix'],
        facilities: ['Électricité', 'Eau douce', 'WiFi', 'Sécurité 24/7', 'Douches', 'Restaurant'],
        maxVesselSize: 50,
        depth: 8,
        lastInspection: '2024-08-15',
        nextInspection: '2024-11-15',
        notes: 'Quai principal du port, accès facile, équipements modernes',
        weatherConditions: {
          temperature: 28,
          windSpeed: 12,
          waveHeight: 0.5,
          visibility: 10
        },
        tideInfo: {
          currentTide: 1.2,
          nextHighTide: '2024-09-01T14:30:00',
          nextLowTide: '2024-09-01T20:45:00'
        },
        occupancyRate: 20,
        dailyRevenue: 25000,
        safetyRating: 4.8
      },
      {
        id: '2',
        name: 'Quai de Pêche',
        location: 'Port de Saint-Louis',
        coordinates: [16.0333, -16.5000],
        capacity: 3,
        status: 'occupied',
        currentVessels: ['Espoir des Mers', 'Chalutier Atlantique'],
        facilities: ['Électricité', 'Eau douce', 'Glace', 'Chambres froides', 'Atelier mécanique'],
        maxVesselSize: 30,
        depth: 5,
        lastInspection: '2024-08-10',
        nextInspection: '2024-11-10',
        notes: 'Spécialisé pour les pirogues de pêche, équipements de transformation',
        weatherConditions: {
          temperature: 26,
          windSpeed: 8,
          waveHeight: 0.3,
          visibility: 12
        },
        tideInfo: {
          currentTide: 0.8,
          nextHighTide: '2024-09-01T15:15:00',
          nextLowTide: '2024-09-01T21:30:00'
        },
        occupancyRate: 67,
        dailyRevenue: 18000,
        safetyRating: 4.5
      },
      {
        id: '3',
        name: 'Quai Commercial',
        location: 'Port de Dakar',
        coordinates: [14.7167, -17.4677],
        capacity: 2,
        status: 'maintenance',
        currentVessels: [],
        facilities: ['Électricité', 'Eau douce', 'Grue', 'Entrepôt', 'Bureau douane'],
        maxVesselSize: 100,
        depth: 12,
        lastInspection: '2024-08-05',
        nextInspection: '2024-09-05',
        notes: 'En réparation - fermé temporairement pour amélioration des équipements',
        weatherConditions: {
          temperature: 29,
          windSpeed: 15,
          waveHeight: 0.7,
          visibility: 8
        },
        occupancyRate: 0,
        dailyRevenue: 0,
        safetyRating: 4.2
      },
      {
        id: '4',
        name: 'Quai de Plaisance',
        location: 'Marina de Dakar',
        coordinates: [14.7200, -17.4700],
        capacity: 8,
        status: 'available',
        currentVessels: [],
        facilities: ['Électricité', 'Eau douce', 'WiFi', 'Club house', 'Piscine', 'Restaurant'],
        maxVesselSize: 25,
        depth: 4,
        lastInspection: '2024-08-20',
        nextInspection: '2024-11-20',
        notes: 'Marina moderne pour bateaux de plaisance',
        weatherConditions: {
          temperature: 27,
          windSpeed: 10,
          waveHeight: 0.2,
          visibility: 15
        },
        occupancyRate: 0,
        dailyRevenue: 5000,
        safetyRating: 4.9
      }
    ];

    setQuais(mockQuais);
  };

  const filterQuais = () => {
    let filtered = quais.filter(quai => {
      const matchesSearch = quai.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quai.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quai.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredQuais(filtered);
  };

  const updateStats = () => {
    const total = quais.length;
    const available = quais.filter(q => q.status === 'available').length;
    const occupied = quais.filter(q => q.status === 'occupied').length;
    const maintenance = quais.filter(q => q.status === 'maintenance').length;
    const reserved = quais.filter(q => q.status === 'reserved').length;
    const totalRevenue = quais.reduce((sum, q) => sum + (q.dailyRevenue || 0), 0);
    const averageOccupancy = quais.length > 0 ?
      quais.reduce((sum, q) => sum + (q.occupancyRate || 0), 0) / quais.length : 0;

    setStats({
      total,
      available,
      occupied,
      maintenance,
      reserved,
      totalRevenue,
      averageOccupancy
    });
  };

  const handleAddQuai = async (quaiData: Omit<Quai, 'id'>) => {
    const newQuai: Quai = {
      ...quaiData,
      id: Date.now().toString()
    };
    setQuais(prev => [newQuai, ...prev]);
    setShowAddForm(false);
  };

  const handleEditQuai = async (quaiId: string, quaiData: Partial<Quai>) => {
    setQuais(prev => prev.map(quai =>
      quai.id === quaiId ? { ...quai, ...quaiData } : quai
    ));
    setEditingQuai(null);
  };

  const handleDeleteQuai = async (quaiId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quai ?')) {
      setQuais(prev => prev.filter(quai => quai.id !== quaiId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Ship className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getVesselTypeIcon = (type: string) => {
    switch (type) {
      case 'pirogue': return <Ship className="w-4 h-4" />;
      case 'chalutier': return <Anchor className="w-4 h-4" />;
      case 'cargo': return <Navigation className="w-4 h-4" />;
      case 'passenger': return <Users className="w-4 h-4" />;
      default: return <Ship className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const getQuaiVessels = (quaiId: string) => {
    return vessels.filter(v => v.status === 'docked' || v.status === 'loading' || v.status === 'unloading');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Quais</h1>
        <p className="text-gray-600">Surveillance et gestion des quais portuaires</p>
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
              <p className="text-sm font-medium text-gray-600">Total Quais</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Anchor className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Occupés</p>
              <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Revenus/Jour</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un quai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="occupied">Occupé</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Réservé</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Quai</span>
          </motion.button>
        </div>
      </div>

      {/* Liste des quais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuais.map((quai, index) => (
          <motion.div
            key={quai.id}
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
                      <Anchor className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{quai.name}</h3>
                      <p className="text-sm text-gray-600">{quai.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quai.status)} flex items-center space-x-1`}>
                      {getStatusIcon(quai.status)}
                      <span>
                        {quai.status === 'available' ? 'Disponible' :
                         quai.status === 'occupied' ? 'Occupé' :
                         quai.status === 'maintenance' ? 'Maintenance' : 'Réservé'}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">Capacité: {quai.capacity}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedQuai(quai);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingQuai(quai)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quai ?')) {
                        setQuais(quais.filter(q => q.id !== quai.id));
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Profondeur: {quai.depth}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Ship className="w-4 h-4 text-gray-400" />
                  <span>Max: {quai.maxVesselSize}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{quai.currentVessels.length} bateaux</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{quai.occupancyRate}% occupé</span>
                </div>
              </div>

              {quai.weatherConditions && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Conditions météo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Temp: {quai.weatherConditions.temperature}°C</div>
                    <div>Vent: {quai.weatherConditions.windSpeed} km/h</div>
                    <div>Vagues: {quai.weatherConditions.waveHeight}m</div>
                    <div>Visibilité: {quai.weatherConditions.visibility}km</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Inspection: {new Date(quai.nextInspection).toLocaleDateString('fr-FR')}</span>
                <span>Revenus: {formatCurrency(quai.dailyRevenue || 0)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Formulaire d'ajout/édition */}
      <AnimatePresence>
        {(showAddForm || editingQuai) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowAddForm(false);
              setEditingQuai(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingQuai ? 'Modifier le Quai' : 'Nouveau Quai'}
                </h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const latitude = parseFloat(formData.get('latitude') as string) || 14.7167;
                  const longitude = parseFloat(formData.get('longitude') as string) || -17.4677;
                  
                  const quaiData = {
                    name: formData.get('name') as string,
                    location: formData.get('location') as string,
                    capacity: parseInt(formData.get('capacity') as string),
                    status: formData.get('status') as 'available' | 'occupied' | 'maintenance' | 'reserved',
                    maxVesselSize: parseInt(formData.get('maxVesselSize') as string),
                    depth: parseFloat(formData.get('depth') as string),
                    facilities: (formData.get('facilities') as string).split(',').map(f => f.trim()),
                    notes: formData.get('notes') as string,
                    coordinates: [latitude, longitude] as [number, number],
                    currentVessels: [],
                    lastInspection: new Date().toISOString().split('T')[0],
                    nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    occupancyRate: 0,
                    dailyRevenue: 0,
                    safetyRating: 5.0
                  };

                  if (editingQuai) {
                    handleEditQuai(editingQuai.id, quaiData);
                  } else {
                    handleAddQuai(quaiData);
                  }
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nom du quai</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingQuai?.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Localisation</label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={editingQuai?.location}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Capacité (bateaux)</label>
                      <input
                        type="number"
                        name="capacity"
                        defaultValue={editingQuai?.capacity}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Statut</label>
                      <select
                        name="status"
                        defaultValue={editingQuai?.status || 'available'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="available">Disponible</option>
                        <option value="occupied">Occupé</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Réservé</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Taille max bateau (m)</label>
                      <input
                        type="number"
                        name="maxVesselSize"
                        defaultValue={editingQuai?.maxVesselSize}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Profondeur (m)</label>
                      <input
                        type="number"
                        name="depth"
                        defaultValue={editingQuai?.depth}
                        required
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Latitude GPS</label>
                      <input
                        type="number"
                        name="latitude"
                        step="any"
                        defaultValue={editingQuai?.coordinates?.[0] || 14.7167}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="14.7167"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Longitude GPS</label>
                      <input
                        type="number"
                        name="longitude"
                        step="any"
                        defaultValue={editingQuai?.coordinates?.[1] || -17.4677}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="-17.4677"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Équipements (séparés par des virgules)</label>
                    <input
                      type="text"
                      name="facilities"
                      defaultValue={editingQuai?.facilities.join(', ')}
                      placeholder="Électricité, Eau douce, WiFi, Sécurité"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      defaultValue={editingQuai?.notes}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingQuai(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingQuai ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedQuai && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails du Quai</h2>
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
                    <h3 className="text-lg font-semibold mb-4">Informations Générales</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900">{selectedQuai.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Localisation</label>
                        <p className="text-gray-900">{selectedQuai.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Capacité</label>
                        <p className="text-gray-900">{selectedQuai.capacity} bateaux</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Profondeur</label>
                        <p className="text-gray-900">{selectedQuai.depth} mètres</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Taille max. bateau</label>
                        <p className="text-gray-900">{selectedQuai.maxVesselSize} mètres</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taux d'occupation:</span>
                        <span className="font-medium">{selectedQuai.occupancyRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenus quotidiens:</span>
                        <span className="font-medium">{formatCurrency(selectedQuai.dailyRevenue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score sécurité:</span>
                        <span className="font-medium">{selectedQuai.safetyRating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bateaux présents:</span>
                        <span className="font-medium">{selectedQuai.currentVessels.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Équipements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedQuai.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQuai.tideInfo && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Informations de Marée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">Marée actuelle</div>
                        <div className="text-lg font-bold text-blue-600">{selectedQuai.tideInfo.currentTide}m</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-900">Prochaine haute</div>
                        <div className="text-sm text-green-600">
                          {new Date(selectedQuai.tideInfo.nextHighTide).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-900">Prochaine basse</div>
                        <div className="text-sm text-orange-600">
                          {new Date(selectedQuai.tideInfo.nextLowTide).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Bateaux Présents</h3>
                  <div className="space-y-3">
                    {getQuaiVessels(selectedQuai.id).map(vessel => (
                      <div key={vessel.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getVesselTypeIcon(vessel.type)}
                          <div>
                            <div className="font-medium text-gray-900">{vessel.name}</div>
                            <div className="text-sm text-gray-600">Capitaine: {vessel.captain}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{vessel.size}m</div>
                          <div className="text-xs text-gray-500">
                            {vessel.status === 'docked' ? 'À quai' :
                             vessel.status === 'loading' ? 'Chargement' : 'Déchargement'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {getQuaiVessels(selectedQuai.id).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Aucun bateau présent actuellement
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

export default QuaiManagement;