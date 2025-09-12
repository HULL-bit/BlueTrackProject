import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Battery, 
  Signal, 
  Clock, 
  RefreshCw,
  Play,
  Pause,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { gpsService, GPSPosition } from '../services/gpsService';

// Icône personnalisée pour les trackers GPS
const createTrackerIcon = (isActive: boolean, batteryLevel?: number) => {
  const color = isActive ? '#10B981' : '#EF4444';
  const batteryColor = batteryLevel && batteryLevel < 20 ? '#EF4444' : 
                      batteryLevel && batteryLevel < 50 ? '#F59E0B' : '#10B981';
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <rect x="14" y="4" width="4" height="6" fill="${batteryColor}" rx="1"/>
        <text x="16" y="8" text-anchor="middle" font-size="6" fill="white">${batteryLevel || '?'}%</text>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface LiveGPSMapProps {
  className?: string;
  height?: string;
}

const MapUpdater: React.FC<{ positions: GPSPosition[] }> = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const lats = positions.map(p => p.latitude);
      const lons = positions.map(p => p.longitude);
      const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
      const avgLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;
      
      map.setView([avgLat, avgLon], map.getZoom());
    }
  }, [positions, map]);
  
  return null;
};

const LiveGPSMap: React.FC<LiveGPSMapProps> = ({ 
  className = '', 
  height = '600px' 
}) => {
  const [positions, setPositions] = useState<GPSPosition[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<GPSPosition | null>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(5000);
  const mapRef = useRef(null);

  // Coordonnées par défaut (Cayar, Sénégal)
  const defaultCenter: [number, number] = [14.7167, -17.4677];

  useEffect(() => {
    const handlePositionsUpdate = (newPositions: GPSPosition[]) => {
      setPositions(newPositions);
      setLastUpdate(new Date());
      setIsUpdating(false);
    };

    // Ajouter le listener
    gpsService.addListener(handlePositionsUpdate);

    // Démarrer les mises à jour automatiques
    if (autoUpdate) {
      gpsService.startRealTimeUpdates(updateInterval);
    }

    return () => {
      gpsService.removeListener(handlePositionsUpdate);
      gpsService.stopRealTimeUpdates();
    };
  }, [autoUpdate, updateInterval]);

  const handleManualRefresh = async () => {
    setIsUpdating(true);
    try {
      const newPositions = await gpsService.getLivePositions();
      setPositions(newPositions);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAutoUpdate = () => {
    if (autoUpdate) {
      gpsService.stopRealTimeUpdates();
    } else {
      gpsService.startRealTimeUpdates(updateInterval);
    }
    setAutoUpdate(!autoUpdate);
  };

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} km/h`;
  };

  const formatHeading = (heading: number) => {
    return `${heading.toFixed(0)}°`;
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-500';
    if (level < 20) return 'text-red-500';
    if (level < 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSignalColor = (strength?: number) => {
    if (!strength) return 'text-gray-500';
    if (strength < 2) return 'text-red-500';
    if (strength < 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Header avec contrôles */}
      <div className="absolute top-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-800">Positions GPS en Temps Réel</h3>
            </div>
            <div className="text-sm text-gray-600">
              {positions.length} tracker{positions.length > 1 ? 's' : ''} actif{positions.length > 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Contrôles de mise à jour */}
            <button
              onClick={toggleAutoUpdate}
              className={`p-2 rounded-lg transition-colors ${
                autoUpdate 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoUpdate ? 'Arrêter les mises à jour automatiques' : 'Démarrer les mises à jour automatiques'}
            >
              {autoUpdate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleManualRefresh}
              disabled={isUpdating}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 transition-colors"
              title="Actualiser manuellement"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Informations de statut */}
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            {autoUpdate ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{autoUpdate ? 'Mise à jour automatique' : 'Mise à jour manuelle'}</span>
          </div>
          {lastUpdate && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Carte */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full rounded-lg"
        style={{ height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater positions={positions} />
        
        {/* Marqueurs des positions GPS */}
        <AnimatePresence>
          {positions.map((position) => (
            <Marker
              key={`${position.device_id}-${position.timestamp}`}
              position={[position.latitude, position.longitude]}
              icon={createTrackerIcon(position.is_active, position.battery_level)}
              eventHandlers={{
                click: () => setSelectedPosition(position)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${position.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h3 className="font-bold text-gray-800">{position.full_name}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dispositif:</span>
                      <span className="font-medium">{position.device_id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-mono text-xs">
                        {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vitesse:</span>
                      <span className="font-medium">{formatSpeed(position.speed)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Direction:</span>
                      <span className="font-medium">{formatHeading(position.heading)}</span>
                    </div>
                    
                    {position.battery_level && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Batterie:</span>
                        <div className="flex items-center space-x-1">
                          <Battery className={`w-3 h-3 ${getBatteryColor(position.battery_level)}`} />
                          <span className={`font-medium ${getBatteryColor(position.battery_level)}`}>
                            {position.battery_level}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {position.signal_strength && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Signal:</span>
                        <div className="flex items-center space-x-1">
                          <Signal className={`w-3 h-3 ${getSignalColor(position.signal_strength)}`} />
                          <span className={`font-medium ${getSignalColor(position.signal_strength)}`}>
                            {position.signal_strength}/5
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière mise à jour:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(position.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </AnimatePresence>
      </MapContainer>

      {/* Panel de détails */}
      {selectedPosition && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-20 right-4 z-20 bg-white rounded-lg shadow-lg p-4 w-80"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Détails du Tracker</h4>
            <button
              onClick={() => setSelectedPosition(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Pêcheur</label>
              <p className="font-medium">{selectedPosition.full_name}</p>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Dispositif</label>
              <p className="font-mono text-sm">{selectedPosition.device_id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Vitesse</label>
                <p className="font-medium">{formatSpeed(selectedPosition.speed)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Direction</label>
                <p className="font-medium">{formatHeading(selectedPosition.heading)}</p>
              </div>
            </div>
            
            {selectedPosition.battery_level && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Batterie</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedPosition.battery_level < 20 ? 'bg-red-500' :
                        selectedPosition.battery_level < 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${selectedPosition.battery_level}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{selectedPosition.battery_level}%</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Message si aucune position */}
      {positions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune position GPS</h3>
            <p className="text-sm text-gray-500 mb-4">
              Les positions des trackers GPS s'afficheront ici en temps réel
            </p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveGPSMap;

