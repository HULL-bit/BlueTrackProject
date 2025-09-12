import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Interface pour les commandes Totarget
interface TotargetCommand {
  deviceId: string;
  type: string;
  elockCommand?: {
    cmdType: string;
    lockId: string;
    bill: string;
    lineCode: number;
    gate: number;
    key: string;
    validTime?: number;
    businessDataSeqNo?: string;
  };
  paramSettingList?: Array<{
    commandId: string;
    heartbeatInterval?: number;
    defaultLocationUploadInterval?: number;
    inAlarmLocationUploadInterval?: number;
    sleepingLocationUploadInterval?: number;
  }>;
}

// Interface pour les données de dispositif
interface DeviceData {
  deviceId: string;
  deviceType: string;
  imei: string;
  phoneNumber: string;
  userId: number;
  isActive: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  lastCommunication?: string;
}

// Service Totarget pour la gestion des dispositifs GPS
export class TotargetService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = API_CONFIG.TOTARGET.API_KEY;
    this.baseURL = API_CONFIG.TOTARGET.BASE_URL;
  }

  // Envoyer une commande à un dispositif
  async sendCommand(deviceId: string, command: TotargetCommand): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.TOTARGET.COMMAND_ENDPOINT}`,
        {
          deviceId,
          command,
          apiKey: this.apiKey
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.REQUEST
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur envoi commande Totarget:', error);
      throw error;
    }
  }

  // Obtenir le statut d'un dispositif
  async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.TOTARGET.STATUS_ENDPOINT}/${deviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.REQUEST
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération statut dispositif:', error);
      throw error;
    }
  }

  // Créer un nouveau dispositif
  async createDevice(deviceData: DeviceData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.TOTARGET.DEVICE_ENDPOINT}`,
        {
          ...deviceData,
          apiKey: this.apiKey
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.REQUEST
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur création dispositif Totarget:', error);
      throw error;
    }
  }

  // Obtenir la position actuelle d'un dispositif
  async getCurrentLocation(deviceId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.TOTARGET.DEVICE_ENDPOINT}/${deviceId}/location`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.REQUEST
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération position:', error);
      throw error;
    }
  }

  // Configurer les paramètres d'un dispositif
  async configureDevice(deviceId: string, settings: any): Promise<any> {
    try {
      const command: TotargetCommand = {
        deviceId,
        type: 'paramSetting',
        paramSettingList: [{
          commandId: `config_${Date.now()}`,
          ...settings
        }]
      };

      return await this.sendCommand(deviceId, command);
    } catch (error) {
      console.error('Erreur configuration dispositif:', error);
      throw error;
    }
  }

  // Activer/désactiver un dispositif
  async toggleDevice(deviceId: string, isActive: boolean): Promise<any> {
    try {
      const command: TotargetCommand = {
        deviceId,
        type: isActive ? 'activate' : 'deactivate'
      };

      return await this.sendCommand(deviceId, command);
    } catch (error) {
      console.error('Erreur activation/désactivation dispositif:', error);
      throw error;
    }
  }

  // Obtenir l'historique des positions d'un dispositif
  async getLocationHistory(deviceId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.TOTARGET.DEVICE_ENDPOINT}/${deviceId}/history`,
        {
          params: {
            startDate,
            endDate,
            apiKey: this.apiKey
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.REQUEST
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      throw error;
    }
  }
}

// Instance singleton du service Totarget
export const totargetService = new TotargetService();

// Fonctions utilitaires pour les dispositifs GPS
export const DeviceUtils = {
  // Générer un ID de dispositif unique pour une pirogue
  generateDeviceId: (pirogueName: string, userId: number): string => {
    const timestamp = Date.now().toString(36);
    const userPrefix = userId.toString().padStart(3, '0');
    const namePrefix = pirogueName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    return `PIROGUE_${namePrefix}_${userPrefix}_${timestamp}`;
  },

  // Valider un numéro IMEI
  validateIMEI: (imei: string): boolean => {
    if (!imei || imei.length !== 15) return false;
    return /^\d{15}$/.test(imei);
  },

  // Valider un numéro de téléphone sénégalais
  validateSenegalPhone: (phone: string): boolean => {
    if (!phone) return false;
    // Format: +221 XX XXX XXXX ou 221 XX XXX XXXX
    const regex = /^(\+?221)?[0-9]{2}[0-9]{3}[0-9]{4}$/;
    return regex.test(phone.replace(/\s+/g, ''));
  },

  // Formater un numéro de téléphone sénégalais
  formatSenegalPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('221')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 9) {
      return `+221${cleaned}`;
    }
    return phone;
  },

  // Calculer la distance entre deux points GPS
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Déterminer si un point est dans une zone
  isPointInZone: (point: [number, number], zoneCoordinates: [number, number][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = zoneCoordinates.length - 1; i < zoneCoordinates.length; j = i++) {
      const [xi, yi] = zoneCoordinates[i];
      const [xj, yj] = zoneCoordinates[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
};

export default totargetService;
