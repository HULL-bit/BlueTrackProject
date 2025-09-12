// Types principaux pour l'application
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'fisherman' | 'organization' | 'admin';
  profile: UserProfile;
  isActive?: boolean;
  lastLocationUpdate?: string;
}

export interface UserProfile {
  fullName: string;
  phone?: string;
  avatar?: string;
  boatName?: string;
  licenseNumber?: string;
  emergencyContact?: string;
  organizationName?: string;
  organizationType?: string;
}

export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  location?: Location;
  createdAt: string;
  metadata?: any;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  channelId?: string;
  content: string;
  type: 'text' | 'voice' | 'location' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number][];
  type: 'safety' | 'fishing' | 'restricted' | 'navigation';
  isActive: boolean;
  createdBy?: string;
}

export interface Trip {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startLocation: Location;
  endLocation?: Location;
  distance?: number;
  maxSpeed?: number;
  avgSpeed?: number;
  fuelConsumed?: number;
  catchWeight?: number;
  notes?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface WeatherCondition {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  visibility: number;
  pressure: number;
  humidity: number;
  condition: string;
  icon: string;
  timestamp: string;
  location?: {
    name: string;
    lat: number;
    lon: number;
  };
}

export interface TrackerDevice {
  id: string;
  deviceId: string;
  deviceType: 'gps_tracker' | 'smartphone' | 'satellite';
  userId: string;
  imei?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastCommunication?: string;
  batteryLevel?: number;
  signalStrength?: number;
  status?: string;
  location?: Location;
}

export interface TotargetGPSData {
  deviceId: string;
  responseType: 'Upload Data' | 'Location Data Upload';
  msgSeqNo: string;
  gpsLocation: {
    alarm: string;
    status: string;
    isPrecise: boolean;
    lat: string;
    lon: string;
    altitude: number;
    speed: number;
    direction: number;
    gpsTime: string;
    recvTime: string;
    useLbsLocation?: boolean;
    address?: string;
  };
  elockResponse?: {
    cmdType: string;
    elockId: string;
    gate: number;
    bill: string;
    voltage: string;
    status: string;
    lineCode: string;
    sealPassword?: string;
    unsealPassword?: string;
    cmdSource: string;
    time: string;
    businessDataSeqNo: string;
  };
  extraInfoDescArr: string[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'emergency' | 'organization';
  isActive: boolean;
  createdBy: string;
  memberCount?: number;
}

export interface FleetStatistics {
  activeBoats: number;
  totalBoats: number;
  activeTrips: number;
  totalDistance: number;
  activeAlerts: number;
  averageSpeed: number;
}