import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { mapDataService, Balise } from '../services/mapDataService';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const BaliseManagement: React.FC = () => {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [balises, setBalises] = useState<Balise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBalise, setEditingBalise] = useState<Balise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    loadBalises();
  }, []);

  // Éviter les rechargements automatiques pendant qu'un formulaire est ouvert
  useEffect(() => {
    if (showForm || isFormSubmitting) {
      console.log('BaliseManagement - Formulaire ouvert, rechargement automatique désactivé');
    }
  }, [showForm, isFormSubmitting]);

  const loadBalises = async () => {
    // Ne pas recharger si un formulaire est ouvert ou en cours de soumission
    if (showForm || isFormSubmitting) {
      console.log('BaliseManagement - Formulaire ouvert ou en cours de soumission, rechargement différé');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const balisesData = await mapDataService.getBalises(true); // Force refresh
      setBalises(balisesData);
    } catch (err: any) {
      setError('Erreur lors du chargement des balises');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBaliseCreated = async (balise: Balise) => {
    setBalises(prev => [balise, ...prev]);
    setShowForm(false);
    setEditingBalise(null);
    setIsFormSubmitting(false);
    
    // Déclencher un événement pour notifier les cartes
    window.dispatchEvent(new CustomEvent('baliseUpdated', { 
      detail: { action: 'created', balise } 
    }));
    
    // Forcer le rafraîchissement des données
    try {
      await refreshData(true);
    } catch (refreshError) {
      console.error('Erreur rafraîchissement après création balise:', refreshError);
    }
  };

  const handleEditBalise = (balise: Balise) => {
    setEditingBalise(balise);
    setShowForm(true);
  };

  const handleDeleteBalise = async (balise: Balise) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette balise ?')) return;
    
    try {
      await mapDataService.deleteBalise(balise.id);
      setBalises(prev => prev.filter(b => b.id !== balise.id));
      
      // Déclencher un événement pour notifier les cartes
      window.dispatchEvent(new CustomEvent('baliseUpdated', { 
        detail: { action: 'deleted', balise } 
      }));
      
      // Forcer le rafraîchissement des données
      try {
        await refreshData(true);
      } catch (refreshError) {
        console.error('Erreur rafraîchissement après suppression balise:', refreshError);
      }
    } catch (err: any) {
      alert('Erreur lors de la suppression de la balise');
      console.error('Erreur:', err);
    }
  };

  const filteredBalises = balises.filter(balise => {
    const matchesSearch = balise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         balise.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || balise.balise_type === filterType;
    return matchesSearch && matchesType;
  });

  const BaliseForm: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (balise: Balise) => void;
    initialData?: Balise;
    mode: 'create' | 'edit';
    onFormStateChange?: (isSubmitting: boolean) => void;
  }> = ({ isOpen, onClose, onSuccess, initialData, mode, onFormStateChange }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || '',
      balise_type: initialData?.balise_type || 'gps',
      latitude: initialData?.coordinates?.[0] || '',
      longitude: initialData?.coordinates?.[1] || '',
      vessel_name: initialData?.vessel_name || '',
      frequency: initialData?.frequency || '',
      power: initialData?.power || '',
      notes: initialData?.notes || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      // Notifier le composant parent que le formulaire est en cours de soumission
      onFormStateChange?.(true);

      try {
        const baliseData = {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        };

        let result: Balise;
        if (mode === 'create') {
          result = await mapDataService.createBalise(baliseData);
        } else {
          result = await mapDataService.updateBalise(initialData?.id!, baliseData);
        }

        onSuccess(result);
        onClose();
        
        // Déclencher un événement pour notifier les cartes
        window.dispatchEvent(new CustomEvent('baliseUpdated', { 
          detail: { action: mode === 'create' ? 'created' : 'updated', balise: result } 
        }));
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
      } finally {
        setLoading(false);
        // Notifier le composant parent que la soumission est terminée
        onFormStateChange?.(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              {mode === 'create' ? 'Nouvelle Balise' : 'Modifier la Balise'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4" data-form-type="balise">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la balise *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Balise Port de Dakar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de balise *
              </label>
              <select
                name="balise_type"
                value={formData.balise_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gps">GPS</option>
                <option value="vms">VMS</option>
                <option value="ais">AIS</option>
                <option value="emergency">Urgence</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="14.7233"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="-17.4605"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du bateau
              </label>
              <input
                type="text"
                name="vessel_name"
                value={formData.vessel_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Pirogue Alpha"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 121.5 MHz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puissance
                </label>
                <input
                  type="text"
                  name="power"
                  value={formData.power}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 5W"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notes supplémentaires..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                data-submitting={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : (mode === 'create' ? 'Créer' : 'Modifier')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  if (loading && balises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Balises</h1>
        <p className="text-gray-600">Gérez les balises GPS, VMS, AIS et d'urgence</p>
      </div>

      {/* Contrôles */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une balise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="gps">GPS</option>
              <option value="vms">VMS</option>
              <option value="ais">AIS</option>
              <option value="emergency">Urgence</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={loadBalises}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={() => {
                setEditingBalise(null);
                setShowForm(true);
                // Désactiver le rafraîchissement automatique pendant que le formulaire est ouvert
                window.dispatchEvent(new CustomEvent('disableAutoRefresh'));
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter Balise</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des balises */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {filteredBalises.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune balise trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Aucune balise ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première balise.'}
          </p>
          <button
            onClick={() => {
              setEditingBalise(null);
              setShowForm(true);
              // Désactiver le rafraîchissement automatique pendant que le formulaire est ouvert
              window.dispatchEvent(new CustomEvent('disableAutoRefresh'));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer une balise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBalises.map((balise) => (
            <motion.div
              key={balise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    balise.status === 'active' ? 'bg-green-500' :
                    balise.status === 'inactive' ? 'bg-gray-400' :
                    balise.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{balise.name}</h3>
                    <p className="text-sm text-gray-500">{balise.balise_type_display || balise.balise_type}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBalise(balise)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBalise(balise)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {balise.vessel_name && (
                  <p><span className="font-medium">Bateau:</span> {balise.vessel_name}</p>
                )}
                <p><span className="font-medium">Position:</span> {
                  balise.coordinates && balise.coordinates.length >= 2 && 
                  typeof balise.coordinates[0] === 'number' && typeof balise.coordinates[1] === 'number'
                    ? `${balise.coordinates[0].toFixed(6)}, ${balise.coordinates[1].toFixed(6)}`
                    : 'Coordonnées non disponibles'
                }</p>
                {balise.frequency && (
                  <p><span className="font-medium">Fréquence:</span> {balise.frequency}</p>
                )}
                {balise.power && (
                  <p><span className="font-medium">Puissance:</span> {balise.power}</p>
                )}
                <p><span className="font-medium">Créé par:</span> {balise.created_by}</p>
                <p><span className="font-medium">Dernière MAJ:</span> {new Date(balise.last_update || balise.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      <BaliseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBalise(null);
          setIsFormSubmitting(false);
          // Réactiver le rafraîchissement automatique quand le formulaire se ferme
          window.dispatchEvent(new CustomEvent('enableAutoRefresh'));
        }}
        onSuccess={handleBaliseCreated}
        initialData={editingBalise || undefined}
        mode={editingBalise ? 'edit' : 'create'}
        onFormStateChange={setIsFormSubmitting}
      />
    </div>
  );
};

export default BaliseManagement;
