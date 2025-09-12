import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Search, 
  Ship, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Activity,
  Trash2,
  Eye,
  Download,
  Filter,
  Calendar,
  FileText,
  Award,
  Shield,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface Armateur {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  pirogues: string[];
  fishermen: string[];
  licenseNumber: string;
  registrationDate: string;
  status: 'active' | 'suspended' | 'inactive';
  totalCatch?: number;
  totalTrips?: number;
  safetyRating?: number;
  complianceScore?: number;
  lastInspection?: string;
  insuranceExpiry?: string;
  fleetSize?: number;
  activePirogues?: number;
}

interface Pirogue {
  id: string;
  name: string;
  armateurId: string;
  status: 'active' | 'maintenance' | 'retired';
  lastTrip?: string;
  totalCatch?: number;
  deviceId?: string;
}

const ArmateursManagement: React.FC = () => {
  const { user } = useAuth();
  const { pirogues, updatePirogue } = useData();

  const [armateurs, setArmateurs] = useState<Armateur[]>([
    {
      id: '1',
      name: 'Moussa Diop',
      company: 'Armement Diop & Fils',
      email: 'moussa.diop@armement-cayar.sn',
      phone: '+221 77 123 4567',
      address: 'Cayar, Thiès, Sénégal',
      pirogues: ['1', '2', '3'],
      fishermen: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
      licenseNumber: 'ARM-SN-001',
      registrationDate: '2020-01-15',
      status: 'active',
      totalCatch: 1250,
      totalTrips: 45,
      safetyRating: 4.8,
      complianceScore: 95,
      lastInspection: '2024-08-15',
      insuranceExpiry: '2025-06-30',
      fleetSize: 3,
      activePirogues: 2
    },
    {
      id: '2',
      name: 'Awa Ndiaye',
      company: 'GIE Femmes Pêcheuses Cayar',
      email: 'awa.ndiaye@gie-cayar.sn',
      phone: '+221 77 987 6543',
      address: 'Quartier Pêcheurs, Cayar',
      pirogues: ['4', '5'],
      fishermen: ['550e8400-e29b-41d4-a716-446655440003'],
      licenseNumber: 'ARM-SN-002',
      registrationDate: '2019-06-20',
      status: 'active',
      totalCatch: 890,
      totalTrips: 32,
      safetyRating: 4.5,
      complianceScore: 88,
      lastInspection: '2024-07-20',
      insuranceExpiry: '2025-03-15',
      fleetSize: 2,
      activePirogues: 2
    },
    {
      id: '3',
      name: 'Ibrahima Sall',
      company: 'Coopérative Pêcheurs Cayar',
      email: 'ibrahima.sall@coop-cayar.sn',
      phone: '+221 76 555 1234',
      address: 'Zone Portuaire, Cayar',
      pirogues: ['6', '7', '8', '9'],
      fishermen: ['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'],
      licenseNumber: 'ARM-SN-003',
      registrationDate: '2021-03-10',
      status: 'active',
      totalCatch: 2100,
      totalTrips: 78,
      safetyRating: 4.9,
      complianceScore: 92,
      lastInspection: '2024-09-01',
      insuranceExpiry: '2025-08-20',
      fleetSize: 4,
      activePirogues: 3
    }
  ]);

  const [piroguesData, setPiroguesData] = useState<Pirogue[]>([
    { id: '1', name: 'Pirogue Diop 1', armateurId: '1', status: 'active', lastTrip: '2024-09-01', totalCatch: 450, deviceId: '000019246001' },
    { id: '2', name: 'Pirogue Diop 2', armateurId: '1', status: 'active', lastTrip: '2024-08-30', totalCatch: 380, deviceId: '000019246002' },
    { id: '3', name: 'Pirogue Diop 3', armateurId: '1', status: 'maintenance', lastTrip: '2024-08-25', totalCatch: 420 },
    { id: '4', name: 'Pirogue Ndiaye 1', armateurId: '2', status: 'active', lastTrip: '2024-09-01', totalCatch: 320, deviceId: '000019246004' },
    { id: '5', name: 'Pirogue Ndiaye 2', armateurId: '2', status: 'active', lastTrip: '2024-08-31', totalCatch: 570, deviceId: '000019246005' },
    { id: '6', name: 'Pirogue Sall 1', armateurId: '3', status: 'active', lastTrip: '2024-09-01', totalCatch: 680 },
    { id: '7', name: 'Pirogue Sall 2', armateurId: '3', status: 'active', lastTrip: '2024-08-30', totalCatch: 520 },
    { id: '8', name: 'Pirogue Sall 3', armateurId: '3', status: 'active', lastTrip: '2024-08-29', totalCatch: 450 },
    { id: '9', name: 'Pirogue Sall 4', armateurId: '3', status: 'retired', lastTrip: '2024-06-15', totalCatch: 450 }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArmateur, setEditingArmateur] = useState<Armateur | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedArmateur, setSelectedArmateur] = useState<Armateur | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredArmateurs = armateurs.filter(armateur => {
    const matchesSearch = armateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         armateur.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         armateur.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || armateur.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPirogueStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddArmateur = (armateur: Omit<Armateur, 'id'>) => {
    const newArmateur: Armateur = {
      ...armateur,
      id: Date.now().toString(),
      totalCatch: 0,
      totalTrips: 0,
      safetyRating: 5.0,
      complianceScore: 100,
      fleetSize: 0,
      activePirogues: 0
    };
    setArmateurs([...armateurs, newArmateur]);
    setShowAddForm(false);
  };

  const handleEditArmateur = (armateur: Armateur) => {
    setArmateurs(armateurs.map(a => a.id === armateur.id ? armateur : a));
    setEditingArmateur(null);
  };

  const handleDeleteArmateur = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet armateur ?')) {
      setArmateurs(armateurs.filter(a => a.id !== id));
    }
  };

  const getArmateurPirogues = (armateurId: string) => {
    return piroguesData.filter(p => p.armateurId === armateurId);
  };

  const getActivePiroguesCount = (armateurId: string) => {
    return piroguesData.filter(p => p.armateurId === armateurId && p.status === 'active').length;
  };

  const getTotalCatch = (armateurId: string) => {
    return piroguesData
      .filter(p => p.armateurId === armateurId)
      .reduce((sum, p) => sum + (p.totalCatch || 0), 0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Armateurs</h1>
        <p className="text-gray-600">Gérer les familles d'appartenance et armements des pêcheurs</p>
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
              <p className="text-sm font-medium text-gray-600">Total Armateurs</p>
              <p className="text-2xl font-bold text-gray-900">{armateurs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Pirogues Actives</p>
              <p className="text-2xl font-bold text-green-600">
                {piroguesData.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Prises</p>
              <p className="text-2xl font-bold text-purple-600">
                {piroguesData.reduce((sum, p) => sum + (p.totalCatch || 0), 0)} kg
              </p>
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
              <p className="text-sm font-medium text-gray-600">Conformité Moyenne</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(armateurs.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / armateurs.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
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
              placeholder="Rechercher un armateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Armateur</span>
          </motion.button>
        </div>
      </div>

      {/* Liste des armateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArmateurs.map((armateur, index) => (
          <motion.div
            key={armateur.id}
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
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{armateur.name}</h3>
                      <p className="text-sm text-gray-600">{armateur.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(armateur.status)}`}>
                      {armateur.status === 'active' ? 'Actif' : armateur.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                    </span>
                    <span className="text-xs text-gray-500">Licence: {armateur.licenseNumber}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedArmateur(armateur);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingArmateur(armateur)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteArmateur(armateur.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{armateur.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{armateur.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Ship className="w-4 h-4 text-gray-400" />
                  <span>{getActivePiroguesCount(armateur.id)} pirogues actives</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span>{getTotalCatch(armateur.id)} kg total</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Inscrit le {new Date(armateur.registrationDate).toLocaleDateString('fr-FR')}</span>
                  <span>Score: {armateur.complianceScore}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedArmateur && (
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
                  <h2 className="text-xl font-bold text-gray-900">Détails de l'Armateur</h2>
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
                        <p className="text-gray-900">{selectedArmateur.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Entreprise</label>
                        <p className="text-gray-900">{selectedArmateur.company}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Licence</label>
                        <p className="text-gray-900">{selectedArmateur.licenseNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Adresse</label>
                        <p className="text-gray-900">{selectedArmateur.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pirogues actives:</span>
                        <span className="font-medium">{getActivePiroguesCount(selectedArmateur.id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total prises:</span>
                        <span className="font-medium">{getTotalCatch(selectedArmateur.id)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score sécurité:</span>
                        <span className="font-medium">{selectedArmateur.safetyRating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conformité:</span>
                        <span className="font-medium">{selectedArmateur.complianceScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Pirogues de l'Armateur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getArmateurPirogues(selectedArmateur.id).map(pirogue => (
                      <div key={pirogue.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{pirogue.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPirogueStatusColor(pirogue.status)}`}>
                            {pirogue.status === 'active' ? 'Active' : pirogue.status === 'maintenance' ? 'Maintenance' : 'Retirée'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Dernière sortie: {pirogue.lastTrip ? new Date(pirogue.lastTrip).toLocaleDateString('fr-FR') : 'N/A'}</div>
                          <div>Total prises: {pirogue.totalCatch || 0} kg</div>
                          {pirogue.deviceId && <div>GPS: {pirogue.deviceId}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Formulaire d'ajout d'armateur */}
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
                <h3 className="text-xl font-bold text-gray-900">Nouvel Armateur</h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const armateurData = {
                    name: formData.get('name') as string,
                    company: formData.get('company') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    address: formData.get('address') as string,
                    licenseNumber: formData.get('licenseNumber') as string,
                    clpa: formData.get('clpa') as string,
                    pirogues: [],
                    fishermen: [],
                    registrationDate: new Date().toISOString().split('T')[0],
                    status: 'active' as const
                  };
                  handleAddArmateur(armateurData);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nom</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Entreprise</label>
                      <input
                        type="text"
                        name="company"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Adresse</label>
                      <input
                        type="text"
                        name="address"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Numéro de licence</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">CLPA *</label>
                      <select
                        name="clpa"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Sélectionner un CLPA</option>
                        <option value="dakar">Dakar</option>
                        <option value="cayar">Cayar</option>
                        <option value="saint-louis">Saint-Louis</option>
                        <option value="mbour">Mbour</option>
                        <option value="joal">Joal</option>
                        <option value="foundiougne">Foundiougne</option>
                        <option value="kaolack">Kaolack</option>
                        <option value="ziguinchor">Ziguinchor</option>
                        <option value="kafountine">Kafountine</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
    </div>
  );
};

export default ArmateursManagement;
