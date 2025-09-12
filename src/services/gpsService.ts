import { api } from '../lib/djangoApi';

export interface GPSPosition {
  user_id: number;
  username: string;
  full_name: string;
  device_id: string;
  device_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  altitude: number;
  accuracy: number;
  battery_level?: number;
  signal_strength?: number;
  last_communication?: string;
  timestamp: string;
  is_active: boolean;
}

export interface LivePositionsResponse {
  type: string;
  features: Array<{
    type: string;
    properties: GPSPosition;
    geometry: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  }>;
  metadata: {
    total_positions: number;
    last_update: string;
    time_range: string;
  };
}

export interface DeviceStatus {
  device_id: string;
  device_type: string;
  is_active: boolean;
  battery_level?: number;
  signal_strength?: number;
  last_communication?: string;
  user: {
    id: number;
    username: string;
    full_name: string;
  };
  last_position?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
  };
}

class GPSService {
  private static instance: GPSService;
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(positions: GPSPosition[]) => void> = [];

  static getInstance(): GPSService {
    if (!GPSService.instance) {
      GPSService.instance = new GPSService();
    }
    return GPSService.instance;
  }

  /**
   * Récupérer les positions en temps réel
   */
  async getLivePositions(): Promise<GPSPosition[]> {
    try {
      const response = await api.get('/tracking/live-positions/');
      const data: LivePositionsResponse = response.data;
      
      // Convertir les features en positions GPS
      const positions: GPSPosition[] = data.features.map(feature => ({
        ...feature.properties,
        latitude: feature.geometry.coordinates[1], // GeoJSON utilise [lng, lat]
        longitude: feature.geometry.coordinates[0]
      }));
      
      console.log(`📍 ${positions.length} positions GPS récupérées`);
      return positions;
    } catch (error) {
      console.error('Erreur lors de la récupération des positions GPS:', error);
      return [];
    }
  }

  /**
   * Récupérer le statut d'un dispositif
   */
  async getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
    try {
      const response = await api.get(`/tracking/devices/${deviceId}/status/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du statut du dispositif ${deviceId}:`, error);
      return null;
    }
  }

  /**
   * Démarrer la surveillance en temps réel
   */
  startRealTimeUpdates(intervalMs: number = 5000): void {
    if (this.updateInterval) {
      this.stopRealTimeUpdates();
    }

    console.log(`🔄 Démarrage des mises à jour GPS toutes les ${intervalMs}ms`);
    
    this.updateInterval = setInterval(async () => {
      try {
        const positions = await this.getLivePositions();
        this.notifyListeners(positions);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des positions:', error);
      }
    }, intervalMs);

    // Première récupération immédiate
    this.getLivePositions().then(positions => {
      this.notifyListeners(positions);
    });
  }

  /**
   * Arrêter la surveillance en temps réel
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Arrêt des mises à jour GPS');
    }
  }

  /**
   * Ajouter un listener pour les mises à jour
   */
  addListener(callback: (positions: GPSPosition[]) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Supprimer un listener
   */
  removeListener(callback: (positions: GPSPosition[]) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notifier tous les listeners
   */
  private notifyListeners(positions: GPSPosition[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(positions);
      } catch (error) {
        console.error('Erreur dans un listener GPS:', error);
      }
    });
  }

  /**
   * Simuler l'envoi de données GPS (pour les tests)
   */
  async simulateGPSTracker(deviceId: string, positions: Array<{lat: number, lng: number, speed?: number}>): Promise<void> {
    console.log(`🧪 Simulation du tracker ${deviceId} avec ${positions.length} positions`);
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      
      const gpsData = {
        device_id: deviceId,
        imei: `1234567890${deviceId}`,
        latitude: pos.lat,
        longitude: pos.lng,
        speed: pos.speed || Math.random() * 15,
        heading: Math.floor(Math.random() * 360),
        altitude: Math.random() * 10,
        accuracy: 5 + Math.random() * 15,
        battery_level: 20 + Math.floor(Math.random() * 80),
        signal_strength: 1 + Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      };

      try {
        const response = await api.post('/tracking/webhook/tracker/', gpsData);
        console.log(`✅ Position ${i + 1}/${positions.length} envoyée:`, response.data);
        
        // Attendre 2 secondes entre chaque position
        if (i < positions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Erreur envoi position ${i + 1}:`, error);
      }
    }
    
    console.log(`🏁 Simulation terminée pour le tracker ${deviceId}`);
  }
}

export const gpsService = GPSService.getInstance();
export default gpsService;

