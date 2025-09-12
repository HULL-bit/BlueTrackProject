import { User, Location } from '../types';

// Données de test pour les pirogues
export const testPirogues: User[] = [
  {
    id: 'test-pirogue-1',
    email: 'pirogue1@test.com',
    username: 'ndakaaru_1',
    role: 'fisherman',
    profile: {
      fullName: 'Moussa Diop',
      phone: '+221 77 111 1111',
      boatName: 'Ndakaaru',
      licenseNumber: 'SN-CAY-001'
    }
  },
  {
    id: 'test-pirogue-2',
    email: 'pirogue2@test.com',
    username: 'teranga_2',
    role: 'fisherman',
    profile: {
      fullName: 'Awa Ndiaye',
      phone: '+221 77 222 2222',
      boatName: 'Teranga',
      licenseNumber: 'SN-CAY-002'
    }
  },
  {
    id: 'test-pirogue-3',
    email: 'pirogue3@test.com',
    username: 'baobab_3',
    role: 'fisherman',
    profile: {
      fullName: 'Ibrahima Fall',
      phone: '+221 77 333 3333',
      boatName: 'Baobab',
      licenseNumber: 'SN-CAY-003'
    }
  },
  {
    id: 'test-pirogue-4',
    email: 'pirogue4@test.com',
    username: 'sahel_4',
    role: 'fisherman',
    profile: {
      fullName: 'Fatou Sarr',
      phone: '+221 77 444 4444',
      boatName: 'Sahel',
      licenseNumber: 'SN-CAY-004'
    }
  },
  {
    id: 'test-pirogue-5',
    email: 'pirogue5@test.com',
    username: 'atlantique_5',
    role: 'fisherman',
    profile: {
      fullName: 'Ousmane Ba',
      phone: '+221 77 555 5555',
      boatName: 'Atlantique',
      licenseNumber: 'SN-CAY-005'
    }
  }
];

// Générateur de positions GPS réalistes autour de Cayar
export class PirogueSimulator {
  private piroguePositions: Map<string, { lat: number; lon: number; heading: number; speed: number }> = new Map();
  private readonly CAYAR_CENTER = { lat: 14.9325, lon: -17.1925 };
  private readonly MAX_DISTANCE = 0.05; // ~5km du centre
  private readonly UPDATE_INTERVAL = 30000; // 30 secondes

  constructor() {
    this.initializePirogues();
    this.startSimulation();
  }

  private initializePirogues() {
    testPirogues.forEach(pirogue => {
      // Position initiale aléatoire autour de Cayar
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * this.MAX_DISTANCE;
      
      this.piroguePositions.set(pirogue.id, {
        lat: this.CAYAR_CENTER.lat + Math.cos(angle) * distance,
        lon: this.CAYAR_CENTER.lon + Math.sin(angle) * distance,
        heading: Math.random() * 360,
        speed: 3 + Math.random() * 12 // 3-15 nœuds
      });
    });
  }

  private startSimulation() {
    setInterval(() => {
      this.updatePositions();
    }, this.UPDATE_INTERVAL);
  }

  private updatePositions() {
    this.piroguePositions.forEach((position, pirogueId) => {
      // Mouvement réaliste : les pirogues bougent selon leur cap
      const speedKmh = position.speed * 1.852; // Convertir nœuds en km/h
      const distanceKm = (speedKmh * this.UPDATE_INTERVAL) / (1000 * 3600); // Distance en km
      
      // Conversion en degrés (approximation)
      const deltaLat = (distanceKm / 111) * Math.cos(position.heading * Math.PI / 180);
      const deltaLon = (distanceKm / (111 * Math.cos(position.lat * Math.PI / 180))) * Math.sin(position.heading * Math.PI / 180);
      
      let newLat = position.lat + deltaLat;
      let newLon = position.lon + deltaLon;
      
      // Garder les pirogues dans une zone raisonnable autour de Cayar
      const distanceFromCenter = Math.sqrt(
        Math.pow(newLat - this.CAYAR_CENTER.lat, 2) + 
        Math.pow(newLon - this.CAYAR_CENTER.lon, 2)
      );
      
      if (distanceFromCenter > this.MAX_DISTANCE) {
        // Faire demi-tour si trop loin
        position.heading = (position.heading + 180) % 360;
        newLat = position.lat;
        newLon = position.lon;
      }
      
      // Variation aléatoire du cap et de la vitesse
      position.heading += (Math.random() - 0.5) * 20; // ±10 degrés
      position.heading = (position.heading + 360) % 360;
      
      position.speed += (Math.random() - 0.5) * 2; // ±1 nœud
      position.speed = Math.max(2, Math.min(15, position.speed)); // Entre 2 et 15 nœuds
      
      position.lat = newLat;
      position.lon = newLon;
    });
  }

  getCurrentPositions(): Location[] {
    const now = new Date().toISOString();
    
    return Array.from(this.piroguePositions.entries()).map(([pirogueId, position]) => ({
      id: `${pirogueId}-${Date.now()}`,
      userId: pirogueId,
      latitude: position.lat,
      longitude: position.lon,
      timestamp: now,
      speed: Math.round(position.speed * 10) / 10,
      heading: Math.round(position.heading)
    }));
  }

  getPiroguePosition(pirogueId: string): Location | null {
    const position = this.piroguePositions.get(pirogueId);
    if (!position) return null;
    
    return {
      id: `${pirogueId}-${Date.now()}`,
      userId: pirogueId,
      latitude: position.lat,
      longitude: position.lon,
      timestamp: new Date().toISOString(),
      speed: Math.round(position.speed * 10) / 10,
      heading: Math.round(position.heading)
    };
  }

  // Simuler une sortie de zone pour test
  triggerZoneViolation(pirogueId: string) {
    const position = this.piroguePositions.get(pirogueId);
    if (position) {
      // Déplacer la pirogue hors de la zone de sécurité
      position.lat = this.CAYAR_CENTER.lat + 0.08; // ~8km au nord
      position.lon = this.CAYAR_CENTER.lon + 0.08;
    }
  }

  // Simuler une urgence
  triggerEmergency(pirogueId: string) {
    const position = this.piroguePositions.get(pirogueId);
    if (position) {
      // Arrêter la pirogue
      position.speed = 0;
      return this.getPiroguePosition(pirogueId);
    }
    return null;
  }
}

export const pirogueSimulator = new PirogueSimulator();