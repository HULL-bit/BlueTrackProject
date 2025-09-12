import api from '../lib/djangoApi';

export interface Balise {
  id: number;
  name: string;
  balise_type: 'gps' | 'vms' | 'ais' | 'emergency';
  balise_type_display?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  status_display?: string;
  coordinates: [number, number]; // [latitude, longitude]
  vessel_name?: string;
  battery_level?: number;
  signal_strength?: number;
  frequency?: string;
  power?: string;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  last_update?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface Zone {
  id: number;
  name: string;
  description?: string;
  zone_type: 'safety' | 'fishing' | 'restricted' | 'navigation' | 'anchorage' | 'harbor' | 'marine_reserve' | 'exclusion';
  zone_shape: 'circle' | 'polygon' | 'rectangle' | 'line';
  center_latitude?: number;
  center_longitude?: number;
  radius_latitude?: number;
  radius_longitude?: number;
  center_coordinates?: [number, number]; // [latitude, longitude]
  radius_coordinates?: [number, number]; // [latitude, longitude]
  radius?: number;
  coordinates?: any;
  is_active: boolean;
  is_restricted: boolean;
  max_speed?: number;
  color: string;
  opacity: number;
  stroke_color: string;
  stroke_width: number;
  valid_from?: string;
  valid_until?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  geometry?: any; // GeoJSON geometry
  // Propriétés de compatibilité
  type?: string; // alias pour zone_type
  isActive?: boolean; // alias pour is_active
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: any;
  geometry: any;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

class MapDataService {
  private balisesCache: Balise[] = [];
  private zonesCache: Zone[] = [];
  private lastBalisesUpdate: Date | null = null;
  private lastZonesUpdate: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Normalise les données d'une balise reçue de l'API
   */
  private normalizeBalise(apiBalise: any): Balise {
    // S'assurer que les coordonnées sont des nombres
    let coordinates: [number, number];
    if (apiBalise.coordinates && Array.isArray(apiBalise.coordinates) && apiBalise.coordinates.length >= 2) {
      coordinates = [
        parseFloat(apiBalise.coordinates[0]) || 0,
        parseFloat(apiBalise.coordinates[1]) || 0
      ];
    } else {
      coordinates = [
        parseFloat(apiBalise.latitude) || 0,
        parseFloat(apiBalise.longitude) || 0
      ];
    }

    return {
      ...apiBalise,
      created_by: apiBalise.created_by_name || apiBalise.created_by,
      balise_type_display: apiBalise.balise_type_display || this.getBaliseTypeDisplay(apiBalise.balise_type),
      status_display: apiBalise.status_display || this.getStatusDisplay(apiBalise.status),
      coordinates
    };
  }

  /**
   * Retourne l'affichage du type de balise
   */
  private getBaliseTypeDisplay(type: string): string {
    const types = {
      gps: 'GPS',
      vms: 'VMS',
      ais: 'AIS',
      emergency: 'Urgence'
    };
    return types[type as keyof typeof types] || type.toUpperCase();
  }

  /**
   * Retourne l'affichage du statut
   */
  private getStatusDisplay(status: string): string {
    const statuses = {
      active: 'Actif',
      inactive: 'Inactif',
      maintenance: 'Maintenance',
      error: 'Erreur'
    };
    return statuses[status as keyof typeof statuses] || status;
  }

  /**
   * Récupère toutes les balises depuis l'API
   */
  async getBalises(forceRefresh = false): Promise<Balise[]> {
    const now = new Date();
    
    if (!forceRefresh && 
        this.balisesCache.length > 0 && 
        this.lastBalisesUpdate && 
        (now.getTime() - this.lastBalisesUpdate.getTime()) < this.CACHE_DURATION) {
      return this.balisesCache;
    }

    try {
      const response = await api.get('/tracking/balises/');
      const rawBalises = response.data.results || response.data;
      this.balisesCache = rawBalises.map((balise: any) => this.normalizeBalise(balise));
      this.lastBalisesUpdate = now;
      return this.balisesCache;
    } catch (error) {
      console.error('Erreur lors de la récupération des balises:', error);
      return this.balisesCache; // Retourner le cache en cas d'erreur
    }
  }

  /**
   * Récupère toutes les zones depuis l'API
   */
  async getZones(forceRefresh = false): Promise<Zone[]> {
    const now = new Date();
    
    if (!forceRefresh && 
        this.zonesCache.length > 0 && 
        this.lastZonesUpdate && 
        (now.getTime() - this.lastZonesUpdate.getTime()) < this.CACHE_DURATION) {
      return this.zonesCache;
    }

    try {
      const response = await api.get('/zones/');
      this.zonesCache = response.data.results || response.data;
      this.lastZonesUpdate = now;
      return this.zonesCache;
    } catch (error) {
      console.error('Erreur lors de la récupération des zones:', error);
      return this.zonesCache; // Retourner le cache en cas d'erreur
    }
  }

  /**
   * Récupère les balises au format GeoJSON
   */
  async getBalisesGeoJSON(forceRefresh = false): Promise<GeoJSONFeatureCollection> {
    try {
      const response = await api.get('/tracking/balises/geojson/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des balises GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  /**
   * Récupère les zones au format GeoJSON
   */
  async getZonesGeoJSON(forceRefresh = false): Promise<GeoJSONFeatureCollection> {
    try {
      const response = await api.get('/zones/geojson/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des zones GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  /**
   * Crée une nouvelle balise
   */
  async createBalise(baliseData: Partial<Balise>): Promise<Balise> {
    try {
      const response = await api.post('/tracking/balises/', baliseData);
      // Invalider le cache
      this.balisesCache = [];
      this.lastBalisesUpdate = null;
      return this.normalizeBalise(response.data);
    } catch (error) {
      console.error('Erreur lors de la création de la balise:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error;
    }
  }

  /**
   * Crée une nouvelle zone
   */
  async createZone(zoneData: Partial<Zone>): Promise<Zone> {
    try {
      const response = await api.post('/zones/', zoneData);
      // Invalider le cache
      this.zonesCache = [];
      this.lastZonesUpdate = null;
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la zone:', error);
      throw error;
    }
  }

  /**
   * Met à jour une balise
   */
  async updateBalise(id: number, baliseData: Partial<Balise>): Promise<Balise> {
    try {
      const response = await api.patch(`/tracking/balises/${id}/`, baliseData);
      // Invalider le cache
      this.balisesCache = [];
      this.lastBalisesUpdate = null;
      return this.normalizeBalise(response.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la balise:', error);
      throw error;
    }
  }

  /**
   * Met à jour une zone
   */
  async updateZone(id: number, zoneData: Partial<Zone>): Promise<Zone> {
    try {
      const response = await api.patch(`/zones/${id}/`, zoneData);
      // Invalider le cache
      this.zonesCache = [];
      this.lastZonesUpdate = null;
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la zone:', error);
      throw error;
    }
  }

  /**
   * Supprime une balise
   */
  async deleteBalise(id: number): Promise<void> {
    try {
      await api.delete(`/tracking/balises/${id}/`);
      // Invalider le cache
      this.balisesCache = [];
      this.lastBalisesUpdate = null;
    } catch (error) {
      console.error('Erreur lors de la suppression de la balise:', error);
      throw error;
    }
  }

  /**
   * Supprime une zone
   */
  async deleteZone(id: number): Promise<void> {
    try {
      await api.delete(`/zones/${id}/`);
      // Invalider le cache
      this.zonesCache = [];
      this.lastZonesUpdate = null;
    } catch (error) {
      console.error('Erreur lors de la suppression de la zone:', error);
      throw error;
    }
  }

  /**
   * Force le rafraîchissement du cache
   */
  async refreshCache(): Promise<void> {
    await Promise.all([
      this.getBalises(true),
      this.getZones(true)
    ]);
  }

  /**
   * Obtient les statistiques des balises et zones
   */
  async getStats(): Promise<{
    balises: { total: number; active: number; by_type: Record<string, number> };
    zones: { total: number; active: number; by_type: Record<string, number> };
  }> {
    try {
      const [balises, zones] = await Promise.all([
        this.getBalises(),
        this.getZones()
      ]);

      const balisesStats = {
        total: balises.length,
        active: balises.filter(b => b.status === 'active').length,
        by_type: balises.reduce((acc, b) => {
          acc[b.balise_type] = (acc[b.balise_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      const zonesStats = {
        total: zones.length,
        active: zones.filter(z => z.is_active).length,
        by_type: zones.reduce((acc, z) => {
          acc[z.zone_type] = (acc[z.zone_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return { balises: balisesStats, zones: zonesStats };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        balises: { total: 0, active: 0, by_type: {} },
        zones: { total: 0, active: 0, by_type: {} }
      };
    }
  }
}

export const mapDataService = new MapDataService();
