// Types pour l'API Django

export interface UserRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'fisherman' | 'organization';
  boatName?: string;
  licenseNumber?: string;
}

export interface UserProfileData {
  fullName?: string;
  phone?: string;
  boatName?: string;
  licenseNumber?: string;
  avatar?: string;
}

export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
}

export interface TripData {
  userId: string;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  maxSpeed?: number;
  avgSpeed?: number;
  fuelConsumed?: number;
  catchWeight?: number;
  notes?: string;
}

export interface AlertData {
  userId: string;
  type: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, any>;
}

export interface MessageData {
  senderId: string;
  receiverId?: string;
  channelId?: string;
  content: string;
  type: 'text' | 'voice' | 'location' | 'image' | 'file';
  metadata?: Record<string, any>;
}

export interface ZoneData {
  name: string;
  description?: string;
  zone_type: 'safety' | 'fishing' | 'restricted' | 'navigation';
  coordinates: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  is_active: boolean;
  created_by?: string;
}

export interface TrackerDeviceData {
  device_id: string;
  device_type: string;
  user: string;
  imei: string;
  phone_number: string;
  is_active: boolean;
}

export interface FileUploadResponse {
  file_url: string;
  file_id: string;
  filename: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}
