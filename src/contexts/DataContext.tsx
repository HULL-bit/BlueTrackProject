import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authAPI, trackingAPI, alertsAPI, communicationAPI, zonesAPI, weatherAPI } from '../lib/djangoApi';
import { logger } from '../lib/logger';
import { weatherService } from '../lib/weatherApi';
import { testPirogues, pirogueSimulator } from '../lib/testData';
import { Location, Alert, Message, WeatherCondition, Zone, Trip, User, TrackerDevice } from '../types';

interface DataContextType {
  locations: Location[];
  alerts: Alert[];
  messages: Message[];
  weather: WeatherCondition | null;
  zones: Zone[];
  trips: Trip[];
  users: User[];
  trackerDevices: TrackerDevice[];
  fleetStats: any;
  updateLocation: (location: Omit<Location, 'id' | 'timestamp'>) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  uploadFile: (file: File, bucket: string, path: string) => Promise<string>;
  addZone: (zoneData: any) => Promise<void>;
  updateZone: (zoneId: string, zoneData: any) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Données de démonstration pour le mode hors ligne
const mockData = {
  zones: [
    {
      id: '1',
      name: 'Zone de Sécurité Cayar',
      coordinates: [
        [14.9225, -17.2025],
        [14.9225, -17.1825],
        [14.9425, -17.1825],
        [14.9425, -17.2025],
        [14.9225, -17.2025]
      ] as [number, number][],
      type: 'safety' as const,
      zone_type: 'safety' as const,
      zone_shape: 'polygon' as const,
      isActive: true,
      is_active: true
    },
    {
      id: '2',
      name: 'Zone de Pêche Traditionnelle',
      coordinates: [
        [14.9125, -17.2125],
        [14.9125, -17.1925],
        [14.9325, -17.1925],
        [14.9325, -17.2125],
        [14.9125, -17.2125]
      ] as [number, number][],
      type: 'fishing' as const,
      zone_type: 'fishing' as const,
      zone_shape: 'polygon' as const,
      isActive: true,
      is_active: true
    },
    {
      id: '3',
      name: 'Zone Restreinte',
      coordinates: [
        [14.9525, -17.1725],
        [14.9525, -17.1525],
        [14.9725, -17.1525],
        [14.9725, -17.1725],
        [14.9525, -17.1725]
      ] as [number, number][],
      type: 'restricted' as const,
      zone_type: 'restricted' as const,
      zone_shape: 'polygon' as const,
      isActive: true,
      is_active: true
    }
  ],
  messages: [
    {
      id: '1',
      senderId: 'user1',
      channelId: 'general',
      content: 'Bonjour à tous ! Comment va la pêche aujourd\'hui ?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true
    },
    {
      id: '2',
      senderId: 'user2',
      channelId: 'general',
      content: 'Très bien ! Les conditions sont excellentes ce matin.',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true
    },
    {
      id: '3',
      senderId: 'user3',
      channelId: 'weather',
      content: 'Attention, vent fort prévu cet après-midi.',
      type: 'text',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isRead: false
    },
    {
      id: '4',
      senderId: 'user1',
      channelId: 'emergency',
      content: 'Urgence : Pirogue en difficulté au large de Cayar',
      type: 'text',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false
    }
  ]
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trackerDevices, setTrackerDevices] = useState<TrackerDevice[]>([]);
  const [fleetStats, setFleetStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDjangoConnected, setIsDjangoConnected] = useState(false);

  // Vérifier la connexion Django
  useEffect(() => {
    checkDjangoConnection();
  }, []);

  const checkDjangoConnection = async () => {
    try {
      // Ne pas appeler l'API si l'utilisateur n'est pas authentifié
      const hasToken = authAPI.isAuthenticated ? authAPI.isAuthenticated() : !!localStorage.getItem('authToken');
      if (!hasToken) {
        setIsDjangoConnected(false);
        return;
      }

      const response = await authAPI.getProfile();
      if (response) {
        setIsDjangoConnected(true);
        console.log('✅ Connexion Django établie');
      }
    } catch (error) {
      console.warn('⚠️ Django non disponible, utilisation du mode démo');
      setIsDjangoConnected(false);
    }
  };

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isDjangoConnected) {
        await Promise.all([
          loadUsers(),
          loadMessages(),
          loadAlerts(),
          loadZones(),
          loadTrips(),
          loadTrackerDevices(),
          loadFleetStats()
        ]);
      } else {
        // Utiliser les données de démonstration
        setZones(mockData.zones);
        setUsers(testPirogues);
        loadMessagesFromLogs();
        loadAlertsFromLogs();
      }
      
      // Charger les positions GPS
      loadLocations();
      
      // Charger la météo réelle
      await loadRealWeather();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setZones(mockData.zones);
      setUsers(testPirogues);
    } finally {
      setIsLoading(false);
    }
  }, [isDjangoConnected]);

  const refreshData = useCallback(async (forceRefresh = false) => {
    try {
      console.log('🔄 DataContext - Rafraîchissement des données', forceRefresh ? '(forcé)' : '');
      loadLocations();
      await loadRealWeather();
      
      if (isDjangoConnected) {
        await Promise.all([
          loadMessages(),
          loadAlerts(),
          loadZones(forceRefresh),
          loadTrackerDevices(forceRefresh),
          loadFleetStats()
        ]);
      }
    } catch (error) {
      console.error('Erreur actualisation données:', error);
    }
  }, [isDjangoConnected]);

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadInitialData();
      
      // Actualiser les données toutes les 30 secondes
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isDjangoConnected, loadInitialData, refreshData]);

  const loadUsers = async () => {
    try {
      if (isDjangoConnected) {
        const data = await authAPI.getUsers();
        // Gérer les réponses paginées de Django
        const usersArray = data?.results || data;
        if (Array.isArray(usersArray)) {
          const transformedUsers = usersArray.map((u: any) => ({
            id: u.id,
            email: u.email,
            username: u.username,
            role: u.role,
            profile: {
              fullName: u.profile?.full_name || u.username,
              phone: u.profile?.phone,
              avatar: u.profile?.avatar_url,
              boatName: u.profile?.boat_name,
              licenseNumber: u.profile?.license_number,
              emergencyContact: u.profile?.emergency_contact,
              organizationName: u.profile?.organization_name,
              organizationType: u.profile?.organization_type
            }
          }));
          setUsers(transformedUsers);
          console.log('👥 Utilisateurs chargés depuis Django:', transformedUsers.length);
        } else {
          console.warn('Réponse API users non-array:', data);
          setUsers(testPirogues);
        }
      } else {
        console.warn('Django non connecté, utilisation des données de test');
        setUsers(testPirogues);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers(testPirogues);
    }
  };

  const loadTrackerDevices = async (forceRefresh = false) => {
    try {
      // Ajouter un paramètre de cache-busting pour forcer le rafraîchissement
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      const data = await trackingAPI.getDevices(cacheBuster);
      // Gérer les réponses paginées de Django
      const devicesArray = data?.results || data;
      if (Array.isArray(devicesArray)) {
        const transformedDevices = devicesArray.map((device: any) => ({
          id: device.id,
          deviceId: device.device_id,
          deviceType: device.device_type,
          userId: device.user,
          imei: device.imei,
          phoneNumber: device.phone_number,
          isActive: device.is_active,
          lastCommunication: device.last_communication,
          batteryLevel: device.battery_level,
          signalStrength: device.signal_strength,
          status: device.is_active ? 'En ligne' : 'Hors ligne'
        }));
        setTrackerDevices(transformedDevices);
      } else {
        console.warn('Réponse API tracker devices non-array:', data);
      }
    } catch (error) {
      console.error('Erreur chargement dispositifs:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await communicationAPI.getMessages();
      // Gérer les réponses paginées de Django
      const messagesArray = data?.results || data;
      if (Array.isArray(messagesArray)) {
        const transformedMessages = messagesArray.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          channelId: msg.channel_id,
          content: msg.content,
          type: msg.message_type,
          timestamp: msg.created_at,
          isRead: msg.is_read,
          imageUrl: msg.image_url,
          metadata: msg.metadata
        }));
        setMessages(transformedMessages);
      } else {
        console.warn('Réponse API messages non-array:', data);
        loadMessagesFromLogs();
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      loadMessagesFromLogs();
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      // Gérer les réponses paginées de Django
      const alertsArray = data?.results || data;
      if (Array.isArray(alertsArray)) {
        const transformedAlerts = alertsArray.map((alert: any) => ({
          id: alert.id,
          userId: alert.user,
          type: alert.alert_type,
          message: alert.message,
          severity: alert.severity,
          status: alert.status,
          createdAt: alert.created_at,
          location: alert.location ? {
            id: alert.location.id,
            userId: alert.user,
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            timestamp: alert.location.timestamp,
            speed: alert.location.speed,
            heading: alert.location.heading
          } : undefined,
          metadata: alert.metadata
        }));
        setAlerts(transformedAlerts);
      } else {
        console.warn('Réponse API alerts non-array:', data);
        loadAlertsFromLogs();
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      loadAlertsFromLogs();
    }
  };

  const loadMessagesFromLogs = () => {
    // Utiliser les données de test si pas de messages dans les logs
    const loggedMessages = logger.getRecentMessages('general', 100);
    if (loggedMessages.length > 0) {
      const transformedMessages = loggedMessages.map(log => ({
        id: log.id,
        senderId: log.content.senderId,
        receiverId: log.content.receiverId,
        channelId: log.content.channelId,
        content: log.content.content,
        type: log.content.type,
        timestamp: log.timestamp,
        isRead: log.content.isRead || false,
        metadata: log.metadata
      }));
      setMessages(transformedMessages);
    } else {
      // Utiliser les données de test
      setMessages(mockData.messages);
    }
  };

  const loadAlertsFromLogs = () => {
    const loggedAlerts = logger.getRecentAlerts(50);
    const transformedAlerts = loggedAlerts.map(log => ({
      id: log.id,
      userId: log.content.userId,
      type: log.content.type,
      message: log.content.message,
      severity: log.content.severity,
      status: log.content.status || 'active',
      createdAt: log.timestamp,
      location: log.content.location,
      metadata: log.metadata
    }));
    setAlerts(transformedAlerts);
  };

  const loadLocations = async () => {
    try {
      if (isDjangoConnected) {
        const data = await trackingAPI.getLocations();
        // Gérer les réponses paginées de Django
        const locationsArray = data?.results || data;
        if (Array.isArray(locationsArray)) {
          const transformedLocations = locationsArray.map((loc: any) => ({
            id: loc.id,
            userId: loc.user,
            latitude: loc.latitude,
            longitude: loc.longitude,
            speed: loc.speed || 0,
            heading: loc.heading || 0,
            altitude: loc.altitude || 0,
            accuracy: loc.accuracy || 0,
            timestamp: loc.timestamp
          }));
          setLocations(transformedLocations);
          console.log('📍 Positions GPS chargées depuis Django:', transformedLocations.length);
        } else {
          console.warn('Réponse API locations non-array:', data);
          const positions = pirogueSimulator.getCurrentPositions();
          setLocations(positions);
        }
      } else {
        console.warn('Django non connecté, utilisation des données simulées');
        const positions = pirogueSimulator.getCurrentPositions();
        setLocations(positions);
      }
    } catch (error) {
      console.error('Erreur chargement positions GPS:', error);
      const positions = pirogueSimulator.getCurrentPositions();
      setLocations(positions);
    }
  };

  const loadTestPirogueLocations = () => {
    const positions = pirogueSimulator.getCurrentPositions();
    setLocations(positions);
  };

  const loadRealWeather = async () => {
    try {
      if (isDjangoConnected) {
        // Coordonnées par défaut pour Cayar, Sénégal
        const defaultLat = 14.9325;
        const defaultLon = -17.1925;
        
        const weatherData = await weatherAPI.getCurrentWeather(defaultLat, defaultLon);
        setWeather(weatherData);
      } else {
        const weatherData = await weatherService.getCurrentWeather();
        setWeather(weatherData);
      }
      console.log('🌤️ Météo chargée');
    } catch (error) {
      console.error('Erreur chargement météo:', error);
    }
  };

  const loadZones = async (forceRefresh = false) => {
    try {
      // Ajouter un paramètre de cache-busting pour forcer le rafraîchissement
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      const data = await zonesAPI.getZones(cacheBuster);
      console.log('🗺️ Données brutes des zones depuis l\'API:', data);
      
      // Gérer les réponses paginées de Django
      const zonesArray = data?.results || data;
      if (Array.isArray(zonesArray)) {
        const transformedZones = zonesArray.map((zone: any) => {
          console.log('🗺️ Transformation zone:', zone);
          
          // Pour les zones circulaires
          if (zone.zone_shape === 'circle') {
            return {
              id: zone.id,
              name: zone.name,
              description: zone.description,
              zone_type: zone.zone_type,
              zone_shape: zone.zone_shape,
              center_latitude: zone.center_latitude,
              center_longitude: zone.center_longitude,
              radius_latitude: zone.radius_latitude,
              radius_longitude: zone.radius_longitude,
              radius: zone.radius,
              coordinates: zone.coordinates,
              type: zone.zone_type,
              isActive: zone.is_active,
              is_active: zone.is_active,
              is_restricted: zone.is_restricted,
              color: zone.color,
              opacity: zone.opacity,
              stroke_color: zone.stroke_color,
              stroke_width: zone.stroke_width,
              createdBy: zone.created_by,
              created_by: zone.created_by,
              created_at: zone.created_at
            };
          }
          
          // Pour les autres types de zones
          let coordinates: [number, number][] = [];
          
          // Gérer différents formats de coordonnées
          if (zone.coordinates) {
            if (zone.coordinates.coordinates && Array.isArray(zone.coordinates.coordinates)) {
              // Format GeoJSON avec coordinates.coordinates
              if (Array.isArray(zone.coordinates.coordinates[0])) {
                coordinates = zone.coordinates.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
              }
            } else if (Array.isArray(zone.coordinates)) {
              // Format direct array
              coordinates = zone.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            }
          }
          
          // Filtrer les coordonnées invalides
          coordinates = coordinates.filter(coord => 
            Array.isArray(coord) && 
            coord.length === 2 && 
            typeof coord[0] === 'number' && 
            typeof coord[1] === 'number' &&
            !isNaN(coord[0]) && 
            !isNaN(coord[1])
          );
          
          return {
            id: zone.id,
            name: zone.name,
            description: zone.description,
            coordinates: coordinates,
            type: zone.zone_type,
            isActive: zone.is_active,
            createdBy: zone.created_by
          };
        });
        
        console.log('🗺️ Zones transformées:', transformedZones);
        setZones(transformedZones);
      } else {
        console.warn('Réponse API zones non-array:', data);
        setZones(mockData.zones);
      }
    } catch (error) {
      console.error('Erreur chargement zones:', error);
      setZones(mockData.zones);
    }
  };

  const loadTrips = async () => {
    try {
      if (user) {
        const data = await trackingAPI.getTrips(user.id);
        // Gérer les réponses paginées de Django
        const tripsArray = data?.results || data;
        if (Array.isArray(tripsArray)) {
          const transformedTrips = tripsArray.map((trip: any) => ({
            id: trip.id,
            userId: trip.user,
            startTime: trip.start_time,
            endTime: trip.end_time,
            startLocation: {
              id: trip.start_location?.id || '',
              userId: trip.user,
              latitude: trip.start_location?.latitude || 14.9325,
              longitude: trip.start_location?.longitude || -17.1925,
              timestamp: trip.start_time,
              speed: 0,
              heading: 0
            },
            distance: trip.distance_km || 0,
            maxSpeed: trip.max_speed || 0,
            avgSpeed: trip.avg_speed || 0
          }));
          setTrips(transformedTrips);
        } else {
          console.warn('Réponse API trips non-array:', data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
    }
  };

  const loadFleetStats = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'organization') {
        const locationsData = await trackingAPI.getLocations();
        const alertsData = await alertsAPI.getAlerts();
        
        // Gérer les réponses paginées de Django
        const locationsArray = locationsData?.results || locationsData;
        const alertsArray = alertsData?.results || alertsData;
        
        if (Array.isArray(locationsArray) && Array.isArray(alertsArray)) {
          const activeBoats = new Set(locationsArray.map((loc: any) => loc.user)).size;
          const activeAlerts = alertsArray.filter((alert: any) => alert.status === 'active').length;
          
          setFleetStats({
            activeBoats,
            activeAlerts,
            totalLocations: locationsArray.length
          });
        } else {
          console.warn('Données non-array pour les statistiques:', { locationsData, alertsData });
        }
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  // Actions
  const updateLocation = async (location: Omit<Location, 'id' | 'timestamp'>) => {
    try {
      if (isDjangoConnected && user) {
        await trackingAPI.updateLocation({
          userId: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString()
        });
      }
      
      // Toujours mettre à jour les positions locales
      const newLocation: Location = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...location
      };
      setLocations(prev => [newLocation, ...prev.slice(0, 99)]);
    } catch (error) {
      console.error('Erreur mise à jour position:', error);
    }
  };

  const sendMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      let messageId: string;
      
      if (isDjangoConnected) {
        const response = await communicationAPI.sendMessage({
          sender: message.senderId,
          receiver: message.receiverId,
          channel_id: message.channelId,
          content: message.content,
          message_type: message.type,
          metadata: message.metadata
        });
        messageId = response.id;
        console.log('💬 Message envoyé à Django');
      } else {
        messageId = logger.logMessage(message.senderId, message);
        console.log('💬 Message loggé en mode démo');
      }
      
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...message
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!isDjangoConnected) {
        setTimeout(() => {
          loadMessagesFromLogs();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const messageId = logger.logMessage(message.senderId, message);
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...message
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const createAlert = async (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => {
    try {
      let alertId: string;
      
      if (isDjangoConnected) {
        const response = await alertsAPI.createAlert({
          user: alert.userId,
          alert_type: alert.type,
          title: alert.message,
          message: alert.message,
          severity: alert.severity,
          location: alert.location ? {
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            speed: alert.location.speed,
            heading: alert.location.heading,
            timestamp: alert.location.timestamp
          } : null,
          metadata: alert.metadata
        });
        alertId = response.id;
        console.log('🚨 Alerte envoyée à Django');
      } else {
        alertId = logger.logAlert(alert.userId, { ...alert, status: 'active' });
        console.log('🚨 Alerte loggée en mode démo');
      }
      
      const newAlert: Alert = {
        id: alertId,
        createdAt: new Date().toISOString(),
        status: 'active',
        ...alert
      };
      
      setAlerts(prev => [newAlert, ...prev]);
    } catch (error) {
      console.error('Erreur création alerte:', error);
      const alertId = logger.logAlert(alert.userId, { ...alert, status: 'active' });
      const newAlert: Alert = {
        id: alertId,
        createdAt: new Date().toISOString(),
        status: 'active',
        ...alert
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      if (isDjangoConnected) {
        await alertsAPI.acknowledgeAlert(alertId);
        console.log('✅ Alerte acquittée via Django');
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
      ));
    } catch (error) {
      console.error('Erreur acquittement alerte:', error);
    }
  };

  const addUser = async (userData: any) => {
    try {
      if (isDjangoConnected) {
        // Générer un username à partir de l'email (partie avant @)
        const username = userData.email.split('@')[0];
        
        // Formater les données selon l'interface RegisterData
        const formattedData = {
          username: username,
          email: userData.email,
          password: userData.password,
          confirm_password: userData.password, // Même mot de passe pour confirmation
          role: userData.role,
          phone: userData.phone || '',
          profile: {
            full_name: userData.fullName,
            boat_name: userData.boatName || '',
            license_number: userData.licenseNumber || '',
            organization_name: userData.organizationName || '',
            organization_type: userData.role === 'organization' ? 'fishing_cooperative' : ''
          }
        };
        
        console.log('Données formatées pour l\'inscription:', formattedData);
        await authAPI.register(formattedData);
        await loadUsers();
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          username: userData.email.split('@')[0],
          role: userData.role,
          profile: {
            fullName: userData.fullName,
            phone: userData.phone,
            boatName: userData.boatName,
            licenseNumber: userData.licenseNumber
          }
        };
        setUsers(prev => [newUser, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout utilisateur:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    try {
      if (isDjangoConnected) {
        await authAPI.updateProfile(userData);
        await loadUsers();
      } else {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, profile: { ...user.profile, ...userData } } : user
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.warn('Suppression utilisateur non implémentée côté Django');
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    try {
      if (isDjangoConnected) {
        const response = await communicationAPI.uploadFile(file, bucket);
        return response.file_url;
      } else {
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  };

  const addZone = async (zoneData: any) => {
    try {
      if (isDjangoConnected) {
        // Les données sont déjà formatées correctement depuis ZoneManagement
        const apiData = {
          name: zoneData.name,
          description: zoneData.description,
          zone_type: zoneData.zone_type,
          zone_shape: zoneData.zone_shape,
          center_latitude: zoneData.center_latitude,
          center_longitude: zoneData.center_longitude,
          radius_latitude: zoneData.radius_latitude,
          radius_longitude: zoneData.radius_longitude,
          radius: Array.isArray(zoneData.radius) ? parseFloat(zoneData.radius[0]) : 
                  typeof zoneData.radius === 'number' ? zoneData.radius : 
                  parseFloat(zoneData.radius.toString()),
          coordinates: zoneData.coordinates,
          is_active: zoneData.is_active,
          is_restricted: zoneData.is_restricted,
          color: zoneData.color,
          opacity: zoneData.opacity,
          stroke_color: zoneData.stroke_color,
          stroke_width: zoneData.stroke_width
        };

        console.log('📤 DataContext - Données envoyées à l\'API:', apiData);
        console.log('🔵 DataContext - Type du rayon:', typeof apiData.radius);
        console.log('🔵 DataContext - Valeur du rayon:', apiData.radius);
        console.log('🔵 DataContext - Rayon est un tableau:', Array.isArray(apiData.radius));
        await zonesAPI.createZone(apiData);
        await loadZones(true); // Force refresh
      } else {
        const newZone: Zone = {
          id: Date.now().toString(),
          name: zoneData.name,
          coordinates: zoneData.coordinates,
          type: zoneData.type,
          isActive: true
        };
        setZones(prev => [newZone, ...prev]);
      }
    } catch (error: any) {
      console.error('Erreur ajout zone:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      throw error;
    }
  };

  const updateZone = async (zoneId: string, zoneData: any) => {
    try {
      if (isDjangoConnected) {
        await zonesAPI.updateZone(zoneId, zoneData);
        await loadZones(true); // Force refresh
      } else {
        setZones(prev => prev.map(zone => 
          zone.id === zoneId ? { ...zone, ...zoneData } : zone
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour zone:', error);
      throw error;
    }
  };

  const deleteZone = async (zoneId: string) => {
    try {
      if (isDjangoConnected) {
        await zonesAPI.deleteZone(zoneId);
        await loadZones(true); // Force refresh
      } else {
        setZones(prev => prev.filter(zone => zone.id !== zoneId));
      }
    } catch (error) {
      console.error('Erreur suppression zone:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      locations,
      alerts,
      messages,
      weather,
      zones,
      trips,
      users,
      trackerDevices,
      fleetStats,
      updateLocation,
      sendMessage,
      createAlert,
      acknowledgeAlert,
      addUser,
      updateUser,
      deleteUser,
      uploadFile,
      addZone,
      updateZone,
      deleteZone,
      refreshData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};