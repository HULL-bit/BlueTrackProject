import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mapDataService, Zone } from '../services/mapDataService';

// Fonction pour calculer la distance entre deux points GPS en mètres
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  console.log('🔵 Distance calculée:', distance, 'Type:', typeof distance);
  return distance;
};

interface NewZone {
  name: string;
  description: string;
  type: 'safety' | 'fishing' | 'restricted' | 'navigation';
  centerLatitude: number | null;
  centerLongitude: number | null;
  radiusLatitude: number | null;
  radiusLongitude: number | null;
  coordinates: [number, number][];
}

const ZoneManagement: React.FC = () => {
  const { user } = useAuth();
  const { zones, addZone, updateZone, deleteZone, refreshData } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const [newZone, setNewZone] = useState<NewZone>({
    name: '',
    description: '',
    type: 'safety',
    centerLatitude: null,
    centerLongitude: null,
    radiusLatitude: null,
    radiusLongitude: null,
    coordinates: []
  });

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEditing = editingZone !== null;
    console.log(`🚀 ZoneManagement - Début de ${isEditing ? 'modification' : 'ajout'} de zone`);
    console.log('📋 Données du formulaire:', newZone);
    
    // Validation des coordonnées
    if (!newZone.centerLatitude || !newZone.centerLongitude || 
        !newZone.radiusLatitude || !newZone.radiusLongitude) {
      alert('Veuillez remplir toutes les coordonnées (centre et rayon)');
      return;
    }

    // Validation des coordonnées GPS
    if (newZone.centerLatitude < -90 || newZone.centerLatitude > 90 ||
        newZone.centerLongitude < -180 || newZone.centerLongitude > 180 ||
        newZone.radiusLatitude < -90 || newZone.radiusLatitude > 90 ||
        newZone.radiusLongitude < -180 || newZone.radiusLongitude > 180) {
      alert('Erreur: Les coordonnées GPS doivent être valides (latitude: -90 à 90, longitude: -180 à 180)');
      return;
    }
    
    try {
      // Calculer le rayon en mètres à partir des coordonnées centre et rayon
      const radiusInMeters = calculateDistance(
        newZone.centerLatitude!,
        newZone.centerLongitude!,
        newZone.radiusLatitude!,
        newZone.radiusLongitude!
      );

      console.log('🔵 Rayon calculé:', radiusInMeters, 'Type:', typeof radiusInMeters);

      // Vérifier que le rayon est valide
      if (isNaN(radiusInMeters) || !isFinite(radiusInMeters) || radiusInMeters <= 0) {
        alert('Erreur: Le rayon calculé n\'est pas valide. Vérifiez les coordonnées.');
        return;
      }

      // Vérifier que le rayon n'est pas trop grand (max 100km)
      if (radiusInMeters > 100000) {
        alert('Erreur: Le rayon calculé est trop grand (' + Math.round(radiusInMeters/1000) + 'km). Vérifiez les coordonnées du rayon.');
        return;
      }

      console.log('🔵 Création d\'une zone circulaire:', {
        centre: [newZone.centerLatitude, newZone.centerLongitude],
        rayon: [newZone.radiusLatitude, newZone.radiusLongitude],
        distanceCalculee: radiusInMeters + ' mètres'
      });

      // Créer la zone avec les bonnes données pour l'affichage en cercle
      const zoneData = {
        name: newZone.name,
        description: newZone.description,
        zone_type: newZone.type,
        zone_shape: 'circle' as const,
        center_latitude: newZone.centerLatitude,
        center_longitude: newZone.centerLongitude,
        radius_latitude: newZone.radiusLatitude,
        radius_longitude: newZone.radiusLongitude,
        radius: parseFloat(radiusInMeters.toString()), // S'assurer que c'est un nombre
        coordinates: {
          type: "Point",
          coordinates: [newZone.centerLongitude!, newZone.centerLatitude!]
        },
        is_active: true,
        is_restricted: false,
        color: '#10B981', // Vert pour les zones de sécurité
        opacity: 0.3,
        stroke_color: '#059669',
        stroke_width: 2
      };

      console.log('📤 Données envoyées à l\'API:', zoneData);
      console.log('🔵 ZoneManagement - Type du rayon:', typeof zoneData.radius);
      console.log('🔵 ZoneManagement - Valeur du rayon:', zoneData.radius);
      console.log('🔵 ZoneManagement - Rayon est un tableau:', Array.isArray(zoneData.radius));
      console.log('🔵 ZoneManagement - Rayon est NaN:', isNaN(zoneData.radius));
      console.log('🔵 ZoneManagement - Rayon est fini:', isFinite(zoneData.radius));
      console.log('🔵 ZoneManagement - Rayon > 0:', zoneData.radius > 0);
      
      // Validation finale des données
      if (isNaN(zoneData.radius) || !isFinite(zoneData.radius) || zoneData.radius <= 0) {
        console.error('❌ ZoneManagement - Rayon invalide détecté:', zoneData.radius);
        alert('Erreur: Le rayon calculé n\'est pas valide. Vérifiez les coordonnées.');
        return;
      }

      // Vérifier que toutes les données requises sont présentes
      if (!zoneData.name || !zoneData.zone_type || !zoneData.zone_shape) {
        alert('Erreur: Données de zone incomplètes');
        return;
      }

      if (typeof zoneData.radius !== 'number' || isNaN(zoneData.radius)) {
        alert('Erreur: Le rayon calculé n\'est pas valide');
        return;
      }

      console.log('✅ Validation des données réussie, envoi à l\'API...');
      
      if (isEditing && editingZone) {
        // Mode modification - utiliser updateZone du DataContext
        await updateZone(editingZone.id, zoneData);
        console.log('🔄 ZoneManagement - Déclenchement de l\'événement zoneUpdated (modification réussie)');
        window.dispatchEvent(new CustomEvent('zoneUpdated', { 
          detail: { action: 'updated', zone: zoneData } 
        }));
      } else {
        // Mode ajout
        await addZone(zoneData);
        console.log('🔄 ZoneManagement - Déclenchement de l\'événement zoneUpdated (création réussie)');
        window.dispatchEvent(new CustomEvent('zoneUpdated', { 
          detail: { action: 'created', zone: zoneData } 
        }));
      }
      
      // Réinitialiser le formulaire
      setNewZone({
        name: '',
        description: '',
        type: 'safety',
        centerLatitude: null,
        centerLongitude: null,
        radiusLatitude: null,
        radiusLongitude: null,
        coordinates: []
      });
      setEditingZone(null);
      setShowAddForm(false);
      
      // Forcer le rafraîchissement des données
      try {
        await refreshData(true);
      } catch (refreshError) {
        console.error('Erreur rafraîchissement après création:', refreshError);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la zone:', error);
      alert('Erreur lors de la création de la zone. Vérifiez les données saisies.');
      
      // Forcer le rafraîchissement des cartes même en cas d'erreur
      console.log('🔄 ZoneManagement - Forçage du rafraîchissement des cartes après erreur');
      window.dispatchEvent(new CustomEvent('forceMapRefresh'));
    }
  };

  const handleEditZone = (zone: Zone) => {
    console.log('🔵 ZoneManagement - Modification de zone:', zone);
    
    // Extraire les coordonnées depuis center_coordinates et radius_coordinates
    let centerLatitude = zone.center_latitude;
    let centerLongitude = zone.center_longitude;
    let radiusLatitude = zone.radius_latitude;
    let radiusLongitude = zone.radius_longitude;
    
    // Si les coordonnées sont dans center_coordinates (format tableau)
    if (zone.center_coordinates && Array.isArray(zone.center_coordinates) && zone.center_coordinates.length >= 2) {
      centerLatitude = zone.center_coordinates[0];
      centerLongitude = zone.center_coordinates[1];
    }
    
    // Si les coordonnées de rayon sont dans radius_coordinates (format tableau)
    if (zone.radius_coordinates && Array.isArray(zone.radius_coordinates) && zone.radius_coordinates.length >= 2) {
      radiusLatitude = zone.radius_coordinates[0];
      radiusLongitude = zone.radius_coordinates[1];
    }
    
    console.log('🔵 ZoneManagement - Coordonnées extraites:', {
      center: { lat: centerLatitude, lng: centerLongitude },
      radius: { lat: radiusLatitude, lng: radiusLongitude }
    });
    
    // Utiliser le formulaire d'ajout en mode modification
    setNewZone({
      name: zone.name,
      description: zone.description || '',
      type: zone.zone_type || zone.type || 'safety',
      centerLatitude: centerLatitude || null,
      centerLongitude: centerLongitude || null,
      radiusLatitude: radiusLatitude || null,
      radiusLongitude: radiusLongitude || null,
      coordinates: zone.coordinates || []
    });
    setEditingZone(zone);
    setShowAddForm(true);
    
    console.log('🔵 ZoneManagement - Formulaire pré-rempli:', {
      name: zone.name,
      centerLatitude: centerLatitude,
      centerLongitude: centerLongitude,
      radiusLatitude: radiusLatitude,
      radiusLongitude: radiusLongitude
    });
  };


  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    
    try {
      await deleteZone(zoneId);
      
      // Déclencher un événement pour notifier les cartes
      console.log('🔄 ZoneManagement - Déclenchement de l\'événement zoneUpdated (suppression réussie)');
      window.dispatchEvent(new CustomEvent('zoneUpdated', { 
        detail: { action: 'deleted', zoneId } 
      }));
      
      // Forcer le rafraîchissement des données
      try {
        await refreshData(true);
      } catch (refreshError) {
        console.error('Erreur rafraîchissement après suppression:', refreshError);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la zone:', error);
      alert('Erreur lors de la suppression de la zone.');
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'safety': return 'Sécurité';
      case 'fishing': return 'Pêche';
      case 'restricted': return 'Restreinte';
      case 'navigation': return 'Navigation';
      default: return type;
    }
  };

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'safety': return 'bg-green-100 text-green-800';
      case 'fishing': return 'bg-blue-100 text-blue-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      case 'navigation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pas de vérification d'authentification ou de rôle

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Zones</h1>
        <p className="text-gray-600">Gérer les zones de sécurité, pêche et navigation</p>
      </div>

      {/* Header avec actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Zones Actives</h3>
            <p className="text-sm text-gray-600">{zones.length} zones configurées</p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                console.log('🔄 ZoneManagement - Rafraîchissement manuel des cartes');
                try {
                  await refreshData(true); // Force refresh
                  window.dispatchEvent(new CustomEvent('forceMapRefresh'));
                } catch (error) {
                  console.error('Erreur rafraîchissement:', error);
                }
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter une zone</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Statistiques des zones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {['safety', 'fishing', 'restricted', 'navigation'].map((type) => {
          const count = zones.filter(z => (z.type || z.zone_type) === type).length;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{getZoneTypeLabel(type)}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  type === 'safety' ? 'bg-green-100' :
                  type === 'fishing' ? 'bg-blue-100' :
                  type === 'restricted' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    type === 'safety' ? 'text-green-600' :
                    type === 'fishing' ? 'text-blue-600' :
                    type === 'restricted' ? 'text-red-600' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Liste des zones */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Zones Configurées</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zones.map((zone, index) => (
                <motion.tr
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                        <div className="text-sm text-gray-500">
                          {zone.zone_shape === 'circle' ? 'Cercle' : 
                           Array.isArray(zone.coordinates) ? `${zone.coordinates.length} points` : 
                           'Zone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getZoneTypeColor(zone.type || zone.zone_type)}`}>
                      {getZoneTypeLabel(zone.type || zone.zone_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {zone.description || 'Aucune description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (zone.isActive || zone.is_active) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(zone.isActive || zone.is_active) ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditZone(zone)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Modifier la zone"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Supprimer la zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de zone */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingZone ? 'Modifier la zone' : 'Ajouter une zone'}
                </h3>
                
                <form onSubmit={handleAddZone} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la zone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newZone.name}
                      onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Zone de sécurité principale"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de zone *
                    </label>
                    <select
                      required
                      value={newZone.type}
                      onChange={(e) => setNewZone({...newZone, type: e.target.value as 'safety' | 'fishing' | 'restricted' | 'navigation'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="safety">Zone de sécurité</option>
                      <option value="fishing">Zone de pêche</option>
                      <option value="restricted">Zone restreinte</option>
                      <option value="navigation">Zone de navigation</option>
                      <option value="anchorage">Zone de mouillage</option>
                      <option value="harbor">Zone portuaire</option>
                      <option value="marine_reserve">Réserve marine</option>
                      <option value="exclusion">Zone d'exclusion</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newZone.description}
                      onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Description de la zone..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude Centre *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newZone.centerLatitude || ''}
                        onChange={(e) => setNewZone({...newZone, centerLatitude: e.target.value ? parseFloat(e.target.value) : null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Ex: 14.7167"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude Centre *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newZone.centerLongitude || ''}
                        onChange={(e) => setNewZone({...newZone, centerLongitude: e.target.value ? parseFloat(e.target.value) : null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Ex: -17.4677"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude Rayon *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newZone.radiusLatitude || ''}
                        onChange={(e) => setNewZone({...newZone, radiusLatitude: e.target.value ? parseFloat(e.target.value) : null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Ex: 14.7267"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude Rayon *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newZone.radiusLongitude || ''}
                        onChange={(e) => setNewZone({...newZone, radiusLongitude: e.target.value ? parseFloat(e.target.value) : null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Ex: -17.4577"
                      />
                    </div>
                  </div>
                  
                  {editingZone && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        📍 Coordonnées actuelles de la zone
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs text-yellow-700">
                        <div>
                          <strong>Centre:</strong><br />
                          Lat: {editingZone.center_latitude?.toFixed(6) || 'N/A'}<br />
                          Lng: {editingZone.center_longitude?.toFixed(6) || 'N/A'}
                        </div>
                        <div>
                          <strong>Rayon:</strong><br />
                          Lat: {editingZone.radius_latitude?.toFixed(6) || 'N/A'}<br />
                          Lng: {editingZone.radius_longitude?.toFixed(6) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Le rayon sera calculé automatiquement à partir des coordonnées centre et rayon.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingZone(null);
                        setNewZone({
                          name: '',
                          description: '',
                          type: 'safety',
                          centerLatitude: null,
                          centerLongitude: null,
                          radiusLatitude: null,
                          radiusLongitude: null,
                          coordinates: []
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700"
                    >
                      {editingZone ? 'Modifier la zone' : 'Créer la zone'}
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

export default ZoneManagement;