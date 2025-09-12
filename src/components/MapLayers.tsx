import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { mapDataService, Balise, Zone } from '../services/mapDataService';

interface MapLayersProps {
  showBalises?: boolean;
  showZones?: boolean;
  baliseTypes?: string[];
  zoneTypes?: string[];
  onBaliseClick?: (balise: Balise) => void;
  onZoneClick?: (zone: Zone) => void;
}

// Icônes personnalisées pour les balises
const createBaliseIcon = (type: string, status: string) => {
  const colors = {
    gps: '#3B82F6',
    vms: '#10B981',
    ais: '#F59E0B',
    emergency: '#EF4444'
  };

  const statusColors = {
    active: colors[type as keyof typeof colors] || '#6B7280',
    inactive: '#9CA3AF',
    maintenance: '#F59E0B',
    error: '#EF4444'
  };

  const color = statusColors[status as keyof typeof statusColors] || '#6B7280';

  return L.divIcon({
    className: 'custom-balise-icon',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        ${type.toUpperCase().charAt(0)}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const MapLayers: React.FC<MapLayersProps> = ({
  showBalises = true,
  showZones = true,
  baliseTypes = [],
  zoneTypes = [],
  onBaliseClick,
  onZoneClick
}) => {
  const map = useMap();
  const [balises, setBalises] = useState<Balise[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('MapLayers - Chargement des données, showBalises:', showBalises, 'showZones:', showZones);
        const [balisesData, zonesData] = await Promise.all([
          showBalises ? mapDataService.getBalises(true) : Promise.resolve([]), // Force refresh
          showZones ? mapDataService.getZones(true) : Promise.resolve([]) // Force refresh
        ]);

        setBalises(balisesData);
        setZones(zonesData);
        console.log('🗺️ MapLayers - Zones chargées:', zonesData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Erreur lors du chargement des données de carte:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showBalises, showZones]);

  // Rafraîchissement automatique toutes les 10 minutes (très peu agressif)
  useEffect(() => {
    if (!autoRefreshEnabled) {
      console.log('MapLayers - Rafraîchissement automatique désactivé');
      return;
    }

    const interval = setInterval(async () => {
      if (showBalises || showZones) {
        try {
          // Vérifier si une modal de formulaire est ouverte (sélecteurs plus spécifiques)
          const isFormOpen = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50') ||
                           document.querySelector('[role="dialog"]') ||
                           document.querySelector('.modal') ||
                           document.querySelector('.form-modal') ||
                           document.querySelector('form[data-form-type="balise"]') ||
                           document.querySelector('.z-50'); // z-index élevé pour les modales
          
          if (isFormOpen) {
            console.log('MapLayers - Formulaire ouvert détecté, rafraîchissement différé');
            return;
          }

          // Vérifier si un formulaire est en cours de soumission
          const isFormSubmitting = document.querySelector('button[type="submit"]:disabled') ||
                                 document.querySelector('.loading') ||
                                 document.querySelector('[data-submitting="true"]') ||
                                 document.querySelector('button:disabled');
          
          if (isFormSubmitting) {
            console.log('MapLayers - Formulaire en cours de soumission, rafraîchissement différé');
            return;
          }

          // Vérification supplémentaire : si l'utilisateur est en train de taper dans un input
          const activeElement = document.activeElement;
          const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT'
          );
          
          if (isTyping) {
            console.log('MapLayers - Utilisateur en train de taper, rafraîchissement différé');
            return;
          }

          const [balisesData, zonesData] = await Promise.all([
            showBalises ? mapDataService.getBalises(true) : Promise.resolve([]),
            showZones ? mapDataService.getZones(true) : Promise.resolve([])
          ]);

          setBalises(balisesData);
          setZones(zonesData);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Erreur lors du rafraîchissement automatique:', error);
        }
      }
    }, 600000); // 10 minutes - très peu agressif

    return () => clearInterval(interval);
  }, [showBalises, showZones, autoRefreshEnabled]);

  // Écouter les événements de mise à jour des balises
  useEffect(() => {
    const handleBaliseUpdate = (event?: CustomEvent) => {
      console.log('MapLayers - Événement de mise à jour reçu:', event?.detail || 'forceMapRefresh');
      // Forcer le rechargement des données
      const loadData = async () => {
        try {
          const [balisesData, zonesData] = await Promise.all([
            showBalises ? mapDataService.getBalises(true) : Promise.resolve([]),
            showZones ? mapDataService.getZones(true) : Promise.resolve([])
          ]);

          setBalises(balisesData);
          setZones(zonesData);
          setLastUpdate(new Date());
          console.log('MapLayers - Données rechargées après événement:', { balises: balisesData.length, zones: zonesData.length });
        } catch (error) {
          console.error('Erreur lors de la mise à jour des balises:', error);
        }
      };
      loadData();
    };

    const handleDisableAutoRefresh = () => {
      console.log('MapLayers - Désactivation du rafraîchissement automatique');
      setAutoRefreshEnabled(false);
    };

    const handleEnableAutoRefresh = () => {
      console.log('MapLayers - Réactivation du rafraîchissement automatique');
      setAutoRefreshEnabled(true);
    };

    // Écouter les événements personnalisés
    window.addEventListener('baliseUpdated', handleBaliseUpdate);
    window.addEventListener('zoneUpdated', handleBaliseUpdate);
    window.addEventListener('forceMapRefresh', handleBaliseUpdate);
    window.addEventListener('disableAutoRefresh', handleDisableAutoRefresh);
    window.addEventListener('enableAutoRefresh', handleEnableAutoRefresh);

    return () => {
      window.removeEventListener('baliseUpdated', handleBaliseUpdate);
      window.removeEventListener('zoneUpdated', handleBaliseUpdate);
      window.removeEventListener('forceMapRefresh', handleBaliseUpdate);
      window.removeEventListener('disableAutoRefresh', handleDisableAutoRefresh);
      window.removeEventListener('enableAutoRefresh', handleEnableAutoRefresh);
    };
  }, [showBalises, showZones]);

  // Filtrer les balises selon les types
  const filteredBalises = balises.filter(balise => {
    if (baliseTypes.length === 0) return true;
    return baliseTypes.includes(balise.balise_type);
  });

  // Filtrer les zones selon les types
  const filteredZones = zones.filter(zone => {
    if (zoneTypes.length === 0) return true;
    return zoneTypes.includes(zone.zone_type);
  });

  // Ajouter les marqueurs de balises
  useEffect(() => {
    console.log('MapLayers - useEffect marqueurs, showBalises:', showBalises, 'filteredBalises.length:', filteredBalises.length);
    if (!showBalises || filteredBalises.length === 0) {
      console.log('MapLayers - Aucun marqueur à afficher');
      return;
    }

    console.log('MapLayers - Création des marqueurs pour', filteredBalises.length, 'balises');
    const markers: L.Marker[] = [];

    filteredBalises.forEach(balise => {
      const [lat, lng] = balise.coordinates;
      const marker = L.marker([lat, lng], {
        icon: createBaliseIcon(balise.balise_type, balise.status)
      });

      // Popup avec informations de la balise
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 14px;">
            ${balise.name}
          </h3>
          <div style="font-size: 12px; color: #6B7280;">
            <p style="margin: 2px 0;"><strong>Type:</strong> ${balise.balise_type_display || balise.balise_type}</p>
            <p style="margin: 2px 0;"><strong>Statut:</strong> 
              <span style="color: ${balise.status === 'active' ? '#10B981' : '#EF4444'};">
                ${balise.status_display || balise.status}
              </span>
            </p>
            ${balise.vessel_name ? `<p style="margin: 2px 0;"><strong>Bateau:</strong> ${balise.vessel_name}</p>` : ''}
            ${balise.battery_level ? `<p style="margin: 2px 0;"><strong>Batterie:</strong> ${balise.battery_level}%</p>` : ''}
            ${balise.signal_strength ? `<p style="margin: 2px 0;"><strong>Signal:</strong> ${balise.signal_strength}%</p>` : ''}
            <p style="margin: 2px 0;"><strong>Position:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <p style="margin: 2px 0;"><strong>Créé par:</strong> ${balise.created_by}</p>
            ${balise.last_update ? `<p style="margin: 2px 0;"><strong>Dernière MAJ:</strong> ${new Date(balise.last_update).toLocaleString('fr-FR')}</p>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Gestionnaire de clic
      marker.on('click', () => {
        if (onBaliseClick) {
          onBaliseClick(balise);
        }
      });

      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [map, showBalises, filteredBalises, onBaliseClick]);

  // Fonction pour obtenir les couleurs selon le type de zone
  const getZoneColors = (zoneType: string) => {
    switch (zoneType) {
      case 'safety':
        return { color: '#10B981', fillColor: '#10B981' }; // Vert
      case 'fishing':
        return { color: '#3B82F6', fillColor: '#3B82F6' }; // Bleu
      case 'restricted':
        return { color: '#EF4444', fillColor: '#EF4444' }; // Rouge
      case 'navigation':
        return { color: '#8B5CF6', fillColor: '#8B5CF6' }; // Violet
      default:
        return { color: '#6B7280', fillColor: '#6B7280' }; // Gris
    }
  };

  // Ajouter les zones
  useEffect(() => {
    if (!showZones || filteredZones.length === 0) return;

    const layers: L.Layer[] = [];

    filteredZones.forEach(zone => {
      let layer: L.Layer;

      try {
        // Vérifier si la zone a des données de géométrie valides
        if (!zone) {
          console.warn('Zone invalide:', zone);
          return;
        }

        // Obtenir les couleurs selon le type de zone
        const zoneColors = getZoneColors(zone.zone_type);

        // Créer la couche selon le type de forme de zone
        if (zone.zone_shape === 'polygon') {
          // Pour les polygones, utiliser les coordonnées de la géométrie si disponibles
          if (zone.geometry && zone.geometry.type === 'Polygon' && zone.geometry.coordinates) {
            const coordinates = zone.geometry.coordinates[0];
            const latLngs = coordinates
              .filter((coord: [number, number]) => 
                Array.isArray(coord) && 
                coord.length === 2 && 
                typeof coord[0] === 'number' && 
                typeof coord[1] === 'number' &&
                !isNaN(coord[0]) && 
                !isNaN(coord[1])
              )
              .map((coord: [number, number]) => [coord[1], coord[0]]);
            
            if (latLngs.length === 0) {
              console.warn('Zone polygon sans coordonnées numériques valides:', zone);
              return;
            }
            
            layer = L.polygon(latLngs, {
              color: zoneColors.color,
              weight: 3,
              opacity: 0.8,
              fillColor: zoneColors.fillColor,
              fillOpacity: 0.3
            });
          } else {
            console.warn('Zone polygon sans coordonnées valides:', zone);
            return;
          }
        } else if (zone.zone_shape === 'circle') {
          // Pour les cercles, utiliser center_coordinates ou les nouveaux champs
          let centerLat, centerLng, radius;
          
          if (zone.center_coordinates && zone.center_coordinates.length === 2) {
            [centerLat, centerLng] = zone.center_coordinates;
            radius = zone.radius || 1000;
          } else if (zone.center_latitude && zone.center_longitude) {
            centerLat = zone.center_latitude;
            centerLng = zone.center_longitude;
            radius = zone.radius || 1000;
          } else if (zone.geometry && zone.geometry.type === 'Circle' && zone.geometry.coordinates) {
            const [lng, lat] = zone.geometry.coordinates;
            centerLat = lat;
            centerLng = lng;
            radius = zone.radius || 1000;
          } else {
            console.warn('Zone circle sans coordonnées valides:', zone);
            return;
          }
          
          console.log('🔵 Création du cercle sur la carte:', {
            nom: zone.name,
            centre: [centerLat, centerLng],
            rayon: radius + ' mètres',
            couleur: zoneColors.color
          });
          
          layer = L.circle([centerLat, centerLng], {
            radius: radius,
            color: zoneColors.color,
            weight: 3,
            opacity: 0.8,
            fillColor: zoneColors.fillColor,
            fillOpacity: 0.3
          });
        } else if (zone.zone_shape === 'rectangle') {
          // Pour les rectangles, traiter comme des polygones
          if (zone.geometry && zone.geometry.type === 'Polygon' && zone.geometry.coordinates) {
            const coordinates = zone.geometry.coordinates[0];
            const latLngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            layer = L.polygon(latLngs, {
              color: zone.stroke_color,
              weight: zone.stroke_width,
              opacity: 0.8,
              fillColor: zone.color,
              fillOpacity: zone.opacity
            });
          } else {
            console.warn('Zone rectangle sans coordonnées valides:', zone);
            return;
          }
        } else if (zone.zone_shape === 'line') {
          // Pour les lignes
          if (zone.geometry && zone.geometry.type === 'LineString' && zone.geometry.coordinates) {
            const coordinates = zone.geometry.coordinates;
            const latLngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            layer = L.polyline(latLngs, {
              color: zone.stroke_color,
              weight: zone.stroke_width,
              opacity: 0.8
            });
          } else {
            console.warn('Zone line sans coordonnées valides:', zone);
            return;
          }
        } else {
          console.warn('Type de forme de zone non supporté:', zone.zone_shape);
          return;
        }

        // Popup avec informations de la zone
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 14px;">
              ${zone.name}
            </h3>
            <div style="font-size: 12px; color: #6B7280;">
              <p style="margin: 2px 0;"><strong>Type:</strong> ${zone.zone_type}</p>
              <p style="margin: 2px 0;"><strong>Forme:</strong> ${zone.zone_shape}</p>
              <p style="margin: 2px 0;"><strong>Statut:</strong> 
                <span style="color: ${zone.is_active ? '#10B981' : '#EF4444'};">
                  ${zone.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
              ${zone.is_restricted ? '<p style="margin: 2px 0; color: #EF4444;"><strong>⚠️ Zone restreinte</strong></p>' : ''}
              ${zone.max_speed ? `<p style="margin: 2px 0;"><strong>Vitesse max:</strong> ${zone.max_speed} nœuds</p>` : ''}
              <p style="margin: 2px 0;"><strong>Créé par:</strong> ${zone.created_by}</p>
              <p style="margin: 2px 0;"><strong>Créé le:</strong> ${new Date(zone.created_at).toLocaleString('fr-FR')}</p>
              ${zone.valid_from ? `<p style="margin: 2px 0;"><strong>Valide du:</strong> ${new Date(zone.valid_from).toLocaleString('fr-FR')}</p>` : ''}
              ${zone.valid_until ? `<p style="margin: 2px 0;"><strong>Valide jusqu'au:</strong> ${new Date(zone.valid_until).toLocaleString('fr-FR')}</p>` : ''}
            </div>
          </div>
        `;

        layer.bindPopup(popupContent);

        // Gestionnaire de clic
        layer.on('click', () => {
          if (onZoneClick) {
            onZoneClick(zone);
          }
        });

        layer.addTo(map);
        layers.push(layer);
      } catch (error) {
        console.error('Erreur lors de la création de la zone:', error, zone);
      }
    });

    return () => {
      layers.forEach(layer => map.removeLayer(layer));
    };
  }, [map, showZones, filteredZones, onZoneClick]);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px',
        color: '#6B7280'
      }}>
        Chargement des données...
      </div>
    );
  }

  // Afficher un indicateur de mise à jour si nécessaire
  if (loading) {
    return (
      <div className="absolute top-4 right-4 z-[1000] bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          <span>Mise à jour...</span>
        </div>
      </div>
    );
  }

  return null;
};

export default MapLayers;
