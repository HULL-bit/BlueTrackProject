import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Anchor, AlertTriangle, MapPin, Clock, Ship, Waves } from 'lucide-react';
import MapLayers from './MapLayers';
import MapControls from './MapControls';
import { mapDataService } from '../services/mapDataService';

// Custom boat icon with enhanced design
const boatIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0B7285" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#0B7285" stroke-width="2"/>
      <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/>
      <path d="M4 18 6 9h12l2 9"/>
      <path d="M6 13h12"/>
      <path d="M10 9V4l8 2-2 3"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const emergencyIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#DC2626" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="11" fill="#DC2626"/>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

interface MapViewProps {
  className?: string;
}

// const MapUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
//   const map = useMap();
  
  // useEffect(() => {
  //   map.setView(center, map.getZoom());
  // }, [center, map]);
  
//   return null;
// };

const MapView: React.FC<MapViewProps> = ({ className = '' }) => {
  const { locations, zones, alerts, trackerDevices } = useData();
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [showBalises, setShowBalises] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Debug logs
  console.log('🗺️ MapView - Données chargées:', {
    locations: locations.length,
    zones: zones.length,
    alerts: alerts.length,
    trackerDevices: trackerDevices.length,
    user: user?.email
  });

  // Vérifier si Leaflet est disponible
  console.log('🗺️ Leaflet disponible:', typeof window !== 'undefined' && window.L);

  // Center map on Cayar, Senegal
  const cayarCenter: LatLngExpression = [14.9325, -17.1925];
  
  // Get current user location or default
  const currentLocation = locations.find(loc => loc.userId === user?.id);
  const mapCenter = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude] as LatLngExpression
    : cayarCenter;

  // Get emergency alerts with locations
  const emergencyAlerts = alerts.filter(alert => 
    alert.type === 'emergency' && alert.location && alert.status === 'active'
  );

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'safety': return { color: '#10B981', fillColor: '#10B981' };
      case 'fishing': return { color: '#3B82F6', fillColor: '#3B82F6' };
      case 'restricted': return { color: '#EF4444', fillColor: '#EF4444' };
      default: return { color: '#6B7280', fillColor: '#6B7280' };
    }
  };

  const getZoneLabel = (type: string) => {
    switch (type) {
      case 'safety': return 'Zone de Sécurité';
      case 'fishing': return 'Zone de Pêche';
      case 'restricted': return 'Zone Restreinte';
      default: return 'Zone';
    }
  };

  const handleRefresh = async () => {
    try {
      await mapDataService.refreshCache();
      console.log('Données de carte rafraîchies');
      
      // Déclencher un événement pour forcer la mise à jour des cartes
      window.dispatchEvent(new CustomEvent('forceMapRefresh'));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };


  // Test si Leaflet est disponible
  if (typeof window === 'undefined' || !window.L) {
    return (
      <div className={`relative ${className}`} style={{ minHeight: '100vh', height: '100vh' }}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">🗺️</div>
            <div className="text-gray-600">Chargement de la carte...</div>
            <div className="text-sm text-gray-500 mt-2">
              {locations.length} positions, {trackerDevices.length} dispositifs
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: '100vh', height: '100vh' }}>
      <div className="absolute top-2 left-2 z-20 bg-white p-2 rounded shadow text-xs">
        🗺️ Carte OSM - {locations.length} positions, {trackerDevices.length} dispositifs
      </div>
      <div className="absolute top-2 right-2 z-20 bg-white p-2 rounded shadow text-xs">
        Centre: {cayarCenter[0]}, {cayarCenter[1]}
      </div>
      <MapContainer
        center={cayarCenter}
        zoom={12}
        className="h-full w-full rounded-lg z-10"
        style={{ height: '100%', minHeight: '100vh' }}
        ref={mapRef}
      >
       {/* <MapUpdater center={mapCenter} /> */}
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Balises et zones depuis la base de données */}
        <MapLayers 
          showBalises={showBalises}
          showZones={showZones}
          onBaliseClick={(balise) => {
            console.log('Balise cliquée:', balise);
          }}
          onZoneClick={(zone) => {
            console.log('Zone cliquée:', zone);
          }}
        />
        
        {/* Safety and fishing zones */}
        {zones.map(zone => {
          const zoneColors = getZoneColor(zone.type);
          
          console.log('🗺️ MapView - Affichage zone:', {
            nom: zone.name,
            forme: zone.zone_shape,
            centre: [zone.center_latitude, zone.center_longitude],
            rayon: zone.radius,
            coordonnees: zone.coordinates
          });
          
          // Vérifier si c'est un cercle
          if (zone.zone_shape === 'circle' && zone.center_latitude && zone.center_longitude && zone.radius) {
            return (
              <Circle
                key={zone.id}
                center={[zone.center_latitude, zone.center_longitude]}
                radius={zone.radius}
                pathOptions={{
                  color: zoneColors.color,
                  fillColor: zoneColors.fillColor,
                  fillOpacity: 0.3,
                  weight: 3,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="p-3 min-w-48">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: zoneColors.color }}
                      ></div>
                      <h3 className="font-bold text-gray-900">{zone.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getZoneLabel(zone.type)} (Cercle)
                    </p>
                    <p className="text-xs text-gray-500">
                      Rayon: {zone.radius.toFixed(0)} mètres
                    </p>
                  </div>
                </Popup>
              </Circle>
            );
          }
          
          // Pour les autres formes (polygone, rectangle, ligne)
          // Vérifier que les coordonnées sont valides avant d'afficher le polygone
          if (!zone.coordinates || !Array.isArray(zone.coordinates) || zone.coordinates.length === 0) {
            console.warn('🗺️ Zone sans coordonnées valides:', zone);
            return null;
          }
          
          // Vérifier que toutes les coordonnées sont des tableaux de 2 nombres
          const validCoordinates = zone.coordinates.filter(coord => 
            Array.isArray(coord) && 
            coord.length === 2 && 
            typeof coord[0] === 'number' && 
            typeof coord[1] === 'number' &&
            !isNaN(coord[0]) && 
            !isNaN(coord[1])
          );
          
          if (validCoordinates.length === 0) {
            console.warn('🗺️ Zone sans coordonnées numériques valides:', zone);
            return null;
          }
          
          return (
            <Polygon
              key={zone.id}
              positions={validCoordinates}
              pathOptions={{
                color: zoneColors.color,
                fillColor: zoneColors.fillColor,
                fillOpacity: 0.2,
                weight: 3,
                dashArray: zone.type === 'restricted' ? '10, 10' : undefined
              }}
            >
              <Popup>
                <div className="p-3 min-w-48">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zoneColors.color }}
                    ></div>
                    <h3 className="font-bold text-gray-900">{zone.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {getZoneLabel(zone.type)}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
        
        {/* Boat positions */}
        {locations.map(location => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={boatIcon}
          >
            <Popup>
              <div className="p-3 min-w-56">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                    <Ship className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">
                      {location.userId === '1' ? 'Pirogue Ndakaaru' : `Pirogue ${location.userId}`}
                    </span>
                    <p className="text-xs text-gray-500">
                      {location.userId === '1' ? 'Amadou Diallo' : `Pêcheur ${location.userId}`}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vitesse:</span>
                    <span className="font-medium">{typeof location.speed === 'number' ? location.speed.toFixed(1) : (parseFloat(location.speed) || 0).toFixed(1)} nœuds</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cap:</span>
                    <span className="font-medium">{typeof location.heading === 'number' ? location.heading.toFixed(0) : (parseFloat(location.heading) || 0).toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-mono text-xs">{typeof location.latitude === 'number' ? location.latitude.toFixed(4) : (parseFloat(location.latitude) || 0).toFixed(4)}, {typeof location.longitude === 'number' ? location.longitude.toFixed(4) : (parseFloat(location.longitude) || 0).toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Dernière mise à jour:
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(location.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Tracker devices with their latest positions */}
        {trackerDevices.map(device => {
          // Trouver la dernière position pour ce dispositif
          const deviceLocation = locations.find(loc => loc.userId === device.userId);
          if (!deviceLocation) return null;
          
          return (
            <Marker
              key={`device-${device.id}`}
              position={[deviceLocation.latitude, deviceLocation.longitude]}
              icon={device.isActive ? boatIcon : emergencyIcon}
            >
              <Popup>
                <div className="p-3 min-w-56">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${device.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                      <Ship className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">
                        {device.deviceId}
                      </span>
                      <p className="text-xs text-gray-500">
                        {device.isActive ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{device.deviceType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">IMEI:</span>
                      <span className="font-medium text-xs">{device.imei}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Batterie:</span>
                      <span className="font-medium">{device.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Dernière comm:</span>
                      <span className="font-medium text-xs">
                        {new Date(device.lastCommunication).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Emergency alerts */}
        {emergencyAlerts.map(alert => (
          alert.location && (
            <Marker
              key={alert.id}
              position={[alert.location.latitude, alert.location.longitude]}
              icon={emergencyIcon}
            >
              <Popup>
                <div className="p-3 min-w-56">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-red-900">URGENCE</span>
                      <p className="text-xs text-red-600">Intervention requise</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 font-medium">{alert.message}</p>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Sévérité:</span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Heure:</span>
                      <span>{new Date(alert.createdAt).toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Enhanced map legend - positioned to avoid chat overlap */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg text-sm border border-gray-200 z-20"
      >
        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Légende
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-cyan-600 rounded-full flex items-center justify-center">
              <Ship className="w-2 h-2 text-white" />
            </div>
            <span>Pirogues actives</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Zone de sécurité</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Zone de pêche</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span>Alerte urgence</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span>Mise à jour temps réel</span>
          </div>
        </div>
      </motion.div>
      
      {/* Contrôles de la carte */}
      <MapControls
        onRefresh={handleRefresh}
        showBalises={showBalises}
        showZones={showZones}
        onToggleBalises={setShowBalises}
        onToggleZones={setShowZones}
      />
    </div>
  );
};

export default MapView;