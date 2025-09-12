import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import MapLayers from './MapLayers';
import MapControls from './MapControls';
import { mapDataService } from '../services/mapDataService';

// Simple boat icon
const boatIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#0B7285" stroke="white" stroke-width="2">
      <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/>
      <path d="M4 18 6 9h12l2 9"/>
      <path d="M6 13h12"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const SimpleMap: React.FC = () => {
  const mapRef = useRef(null);
  const [showBalises, setShowBalises] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Coordonnées de test autour de Dakar
  const testPositions = [
    { id: 1, lat: 14.7233, lng: -17.4605, name: 'Traqueur 1' },
    { id: 2, lat: 14.7250, lng: -17.4620, name: 'Traqueur 2' },
    { id: 3, lat: 14.7200, lng: -17.4580, name: 'Traqueur 3' }
  ];

  useEffect(() => {
    console.log('🗺️ SimpleMap - Composant monté');
    console.log('🗺️ Leaflet disponible:', typeof window !== 'undefined' && window.L);
  }, []);

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


  return (
    <div className="w-full h-full bg-gray-100 rounded-lg">
      <div className="p-2 text-sm text-gray-600">
        🗺️ Carte de test - {testPositions.length} positions
      </div>
      <MapContainer
        center={[14.7233, -17.4605]}
        zoom={12}
        className="h-full w-full"
        style={{ height: 'calc(100% - 40px)' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Balises et zones depuis la base de données */}
        <MapLayers 
          showBalises={showBalises}
          showZones={showZones}
          onBaliseClick={(balise) => {
            console.log('Balise cliquée dans SimpleMap:', balise);
          }}
          onZoneClick={(zone) => {
            console.log('Zone cliquée dans SimpleMap:', zone);
          }}
        />
        
        {testPositions.map(position => (
          <Marker
            key={position.id}
            position={[position.lat, position.lng]}
            icon={boatIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{position.name}</h3>
                <p>Lat: {position.lat}</p>
                <p>Lng: {position.lng}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
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

export default SimpleMap;
