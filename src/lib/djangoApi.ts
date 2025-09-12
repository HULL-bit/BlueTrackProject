import axios from 'axios';
import {
  UserRegistrationData,
  UserProfileData,
  LocationData,
  TripData,
  AlertData,
  MessageData,
  ZoneData,
  TrackerDeviceData,
  FileUploadResponse
} from '../types/api';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Configuration axios avec intercepteur pour les tokens
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUTS.REQUEST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log pour debug des requêtes POST vers /zones/
    if (config.method === 'post' && config.url?.includes('/zones/')) {
      console.log('🔵 Axios Interceptor - URL:', config.url);
      console.log('🔵 Axios Interceptor - Données:', JSON.stringify(config.data, null, 2));
      console.log('🔵 Axios Interceptor - Type du rayon:', typeof config.data?.radius);
      console.log('🔵 Axios Interceptor - Rayon est un tableau:', Array.isArray(config.data?.radius));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interface pour les données de connexion
interface LoginData {
  email: string;
  password: string;
}

// Interface pour les données d'inscription
interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  role: 'fisherman' | 'organization' | 'admin';
  phone?: string;
  profile: {
    full_name: string;
    boat_name?: string;
    license_number?: string;
    organization_name?: string;
    organization_type?: string;
  };
}

// Interface pour les données utilisateur
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile: {
    full_name: string;
    phone?: string;
    boat_name?: string;
    license_number?: string;
  };
}

// Interface pour la réponse de connexion
interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

// Fonctions d'authentification
export const authAPI = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/users/login/', data);
      const { token, user } = response.data;
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    try {
      // Générer un username à partir de l'email (partie avant @)
      const username = data.email.split('@')[0];
      
      // Préparer les données selon le format attendu par Django
      const registrationData = {
        username: username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        role: data.role,
        phone: data.phone || '',
        profile: {
          full_name: data.profile.full_name,
          boat_name: data.profile.boat_name || '',
          license_number: data.profile.license_number || '',
          organization_name: data.profile.organization_name || '',
          organization_type: data.profile.organization_type || ''
        }
      };
      
      console.log('Données d\'inscription envoyées:', registrationData);
      
      const response = await api.post('/users/register/', registrationData);
      const { token, user } = response.data;
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/users/logout/');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      // Supprimer les données locales
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users/users/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User['profile']>): Promise<User> => {
    try {
      const response = await api.put('/users/profile/', { profile: data });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};

// Interface pour les données de localisation
interface Location {
  id: number;
  user: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
}

// Interface pour les dispositifs de tracking
interface TrackerDevice {
  id: number;
  device_id: string;
  device_type: string;
  user: number;
  imei: string;
  phone_number: string;
  is_active: boolean;
  battery_level?: number;
  signal_strength?: number;
  last_communication?: string;
}

// Fonctions pour les données de tracking
export const trackingAPI = {
  getLocations: async (): Promise<Location[]> => {
    try {
      const response = await api.get('/tracking/locations/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations:', error);
      throw error;
    }
  },

  getDevices: async (): Promise<TrackerDevice[]> => {
    try {
      const response = await api.get('/tracking/devices/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des dispositifs:', error);
      throw error;
    }
  },

  createLocation: async (data: Omit<Location, 'id'>): Promise<Location> => {
    try {
      const response = await api.post('/tracking/locations/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la localisation:', error);
      throw error;
    }
  },

  createDevice: async (data: Omit<TrackerDevice, 'id'>): Promise<TrackerDevice> => {
    try {
      const response = await api.post('/tracking/devices/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du dispositif:', error);
      throw error;
    }
  },

  getTrips: async (userId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/tracking/trips/?user=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des sorties:', error);
      throw error;
    }
  },

  updateLocation: async (data: LocationData): Promise<any> => {
    try {
      // Préparer les données selon le format attendu par Django
      const locationData = {
        user: data.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed || 0,
        heading: data.heading || 0,
        altitude: data.altitude || 0,
        accuracy: data.accuracy || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log('Données de position envoyées:', locationData);
      
      const response = await api.post('/tracking/locations/', locationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error;
    }
  }
};

// Interface pour les données Totarget
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

// Fonctions pour l'API Totarget
export const totargetAPI = {
  sendCommand: async (commands: Record<string, TotargetCommand[]>): Promise<any> => {
    try {
      const response = await api.post('/tracking/totarget/command/', {
        cacheCommandsWhenOffline: false,
        commands
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la commande Totarget:', error);
      throw error;
    }
  },

  getDeviceStatus: async (deviceId: string): Promise<any> => {
    try {
      const response = await api.get(`/tracking/totarget/device/${deviceId}/status/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut du dispositif:', error);
      throw error;
    }
  },

  createDevice: async (deviceData: any): Promise<any> => {
    try {
      const response = await api.post('/tracking/totarget/device/create/', deviceData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du dispositif Totarget:', error);
      throw error;
    }
  }
};

// Interface pour les données utilisateur (gestion)
interface UserManagement {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified?: boolean;
  profile: {
    full_name: string;
    phone?: string;
    boat_name?: string;
    license_number?: string;
  };
  created_at?: string;
  last_activity?: string;
}

// Fonctions pour la gestion des utilisateurs
export const userManagementAPI = {
  getUsers: async (): Promise<UserManagement[]> => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  createUser: async (userData: any): Promise<UserManagement> => {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  updateUser: async (userId: number, userData: any): Promise<UserManagement> => {
    try {
      const response = await api.put(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/users/${userId}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
};

// Interface pour les alertes
interface Alert {
  id: string;
  type: 'emergency' | 'weather' | 'security' | 'maintenance';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Fonctions pour les alertes
export const alertsAPI = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await api.get('/alerts/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },

  createAlert: async (data: Omit<Alert, 'id' | 'createdAt' | 'status'>): Promise<Alert> => {
    try {
      const response = await api.post('/alerts/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      throw error;
    }
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge/`);
    } catch (error) {
      console.error('Erreur lors de l\'acquittement de l\'alerte:', error);
      throw error;
    }
  },

  updateAlert: async (alertId: string, data: Partial<Alert>): Promise<Alert> => {
    try {
      const response = await api.put(`/alerts/${alertId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
      throw error;
    }
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    try {
      await api.delete(`/alerts/${alertId}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'alerte:', error);
      throw error;
    }
  }
};

// Interface pour les messages de communication
interface Message {
  id: string;
  senderId: string;
  channelId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

// Fonctions pour la communication
export const communicationAPI = {
  getMessages: async (channelId?: string): Promise<Message[]> => {
    try {
      const url = channelId ? `/communication/messages/?channel=${channelId}` : '/communication/messages/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  },

  sendMessage: async (data: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
    try {
      const response = await api.post('/communication/messages/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  markAsRead: async (messageId: string): Promise<void> => {
    try {
      await api.post(`/communication/messages/${messageId}/read/`);
    } catch (error) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await api.delete(`/communication/messages/${messageId}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  },

  uploadFile: async (file: File, bucket: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      
      const response = await api.post('/communication/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  }
};

// Interface pour les zones
interface Zone {
  id: string;
  name: string;
  coordinates: [number, number][];
  type: 'safety' | 'fishing' | 'restricted' | 'custom';
  isActive: boolean;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

// Fonctions pour les zones
export const zonesAPI = {
  getZones: async (): Promise<Zone[]> => {
    try {
      const response = await api.get('/zones/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des zones:', error);
      throw error;
    }
  },

  createZone: async (data: Omit<Zone, 'id' | 'createdAt'>): Promise<Zone> => {
    try {
      console.log('🔵 ZonesAPI - Données avant envoi:', JSON.stringify(data, null, 2));
      const response = await api.post('/zones/', data);
      console.log('✅ ZonesAPI - Zone créée avec succès:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ZonesAPI - Erreur lors de la création de la zone:', error);
      console.error('❌ ZonesAPI - Détails de l\'erreur:', error.response?.data);
      console.error('❌ ZonesAPI - Status:', error.response?.status);
      console.error('❌ ZonesAPI - Headers:', error.response?.headers);
      console.error('❌ ZonesAPI - Données envoyées:', JSON.stringify(data, null, 2));
      throw error;
    }
  },

  updateZone: async (zoneId: string, data: Partial<Zone>): Promise<Zone> => {
    try {
      const response = await api.put(`/zones/${zoneId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la zone:', error);
      throw error;
    }
  },

  deleteZone: async (zoneId: string): Promise<void> => {
    try {
      await api.delete(`/zones/${zoneId}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la zone:', error);
      throw error;
    }
  }
};

// Interface pour les conditions météorologiques
interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  description: string;
  icon: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Fonctions pour la météo
export const weatherAPI = {
  getCurrentWeather: async (latitude: number, longitude: number): Promise<WeatherCondition> => {
    try {
      const response = await api.get(`/weather/current/?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      throw error;
    }
  },

  getForecast: async (latitude: number, longitude: number, days: number = 5): Promise<WeatherCondition[]> => {
    try {
      const response = await api.get(`/weather/forecast/?lat=${latitude}&lon=${longitude}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des prévisions météo:', error);
      throw error;
    }
  },

  getWeatherAlerts: async (latitude: number, longitude: number): Promise<Alert[]> => {
    try {
      const response = await api.get(`/weather/alerts/?lat=${latitude}&lon=${longitude}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes météo:', error);
      throw error;
    }
  }
};

export default api;