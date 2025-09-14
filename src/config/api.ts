// Configuration de l'API
export const API_CONFIG = {
  // URL de base de l'API Django
  BASE_URL: 'https://bluetrack-01.onrender.com/api',
  
  // Configuration Totarget
  TOTARGET: {
    // Clé API Totarget - Clé réelle fournie
    API_KEY: 'MJoNQoDJZuCROZZoaPHzzlxn4s5PPWFXF2Tjl3aC3htvi7geQLGz9A==',
    BASE_URL: 'https://api.totarget.com',
    DEVICE_ENDPOINT: '/device',
    COMMAND_ENDPOINT: '/command',
    STATUS_ENDPOINT: '/status'
  },
  
  // Configuration des endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/users/login/',
      REGISTER: '/users/register/',
      PROFILE: '/users/profile/',
      USERS: '/users/users/',
      LOGOUT: '/users/logout/'
    },
    TRACKING: {
      LOCATIONS: '/tracking/locations/',
      DEVICES: '/tracking/devices/',
      TRIPS: '/tracking/trips/',
      TOTARGET_COMMAND: '/tracking/totarget/command/',
      TOTARGET_DEVICE_STATUS: '/tracking/totarget/device',
      TOTARGET_CREATE_DEVICE: '/tracking/totarget/device/create/'
    },
    COMMUNICATION: {
      MESSAGES: '/communication/messages/',
      UPLOAD: '/communication/upload/'
    },
    ALERTS: {
      ALERTS: '/alerts/',
      ACKNOWLEDGE: '/alerts/{id}/acknowledge/'
    },
    ZONES: {
      ZONES: '/zones/'
    },
    WEATHER: {
      CURRENT: '/weather/current/',
      FORECAST: '/weather/forecast/',
      ALERTS: '/weather/alerts/'
    },
    MEDIA: {
      FILES: '/media/files/',
      FILE_DETAIL: '/media/files/{id}/',
      FILE_DOWNLOAD: '/media/files/{id}/download/',
      FILE_LIKE: '/media/files/{id}/like/',
      STATS: '/media/stats/',
      COLLECTIONS: '/media/collections/',
      COLLECTION_DETAIL: '/media/collections/{id}/'
    }
  },
  
  // Configuration des timeouts
  TIMEOUTS: {
    REQUEST: 30000, // 30 secondes
    UPLOAD: 60000   // 60 secondes pour les uploads
  },
  
  // Configuration de la pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  // Configuration des intervalles de mise à jour
  INTERVALS: {
    LOCATIONS_UPDATE: 30000,    // 30 secondes
    WEATHER_UPDATE: 300000,     // 5 minutes
    DEVICE_STATUS: 60000,       // 1 minute
    ALERTS_CHECK: 15000         // 15 secondes
  }
};

// Configuration des types de dispositifs GPS
export const DEVICE_TYPES = {
  PIROGUE: 'pirogue',
  BATEAU: 'bateau',
  VEHICULE: 'vehicule',
  PERSONNEL: 'personnel'
};

// Configuration des types d'alertes
export const ALERT_TYPES = {
  EMERGENCY: 'emergency',
  WEATHER: 'weather',
  SECURITY: 'security',
  MAINTENANCE: 'maintenance',
  ZONE_VIOLATION: 'zone_violation'
};

// Configuration des zones
export const ZONE_TYPES = {
  SAFETY: 'safety',
  FISHING: 'fishing',
  RESTRICTED: 'restricted',
  CUSTOM: 'custom'
};

// Configuration des rôles utilisateur
export const USER_ROLES = {
  FISHERMAN: 'fisherman',
  ORGANIZATION: 'organization',
  ADMIN: 'admin'
};

// Configuration des canaux de communication
export const COMMUNICATION_CHANNELS = {
  GENERAL: 'general',
  EMERGENCY: 'emergency',
  WEATHER: 'weather',
  MAINTENANCE: 'maintenance'
};

export default API_CONFIG;
