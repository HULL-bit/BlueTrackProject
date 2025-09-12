export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          boat_name: string | null;
          license_number: string | null;
          role: 'fisherman' | 'organization' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          boat_name?: string | null;
          license_number?: string | null;
          role?: 'fisherman' | 'organization' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          boat_name?: string | null;
          license_number?: string | null;
          role?: 'fisherman' | 'organization' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          speed: number | null;
          heading: number | null;
          altitude: number | null;
          accuracy: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          latitude: number;
          longitude: number;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          accuracy?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          latitude?: number;
          longitude?: number;
          speed?: number | null;
          heading?: number | null;
          altitude?: number | null;
          accuracy?: number | null;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          type: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
          title: string;
          message: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          status: 'active' | 'acknowledged' | 'resolved';
          location_id: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
          title: string;
          message: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'active' | 'acknowledged' | 'resolved';
          location_id?: string | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
          title?: string;
          message?: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'active' | 'acknowledged' | 'resolved';
          location_id?: string | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string | null;
          channel_id: string | null;
          content: string;
          message_type: 'text' | 'voice' | 'location' | 'image' | 'file';
          metadata: any | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id?: string | null;
          channel_id?: string | null;
          content: string;
          message_type?: 'text' | 'voice' | 'location' | 'image' | 'file';
          metadata?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string | null;
          channel_id?: string | null;
          content?: string;
          message_type?: 'text' | 'voice' | 'location' | 'image' | 'file';
          metadata?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      zones: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          zone_type: 'safety' | 'fishing' | 'restricted' | 'navigation';
          coordinates: any; // GeoJSON polygon
          radius: number | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          zone_type: 'safety' | 'fishing' | 'restricted' | 'navigation';
          coordinates: any;
          radius?: number | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          zone_type?: 'safety' | 'fishing' | 'restricted' | 'navigation';
          coordinates?: any;
          radius?: number | null;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          start_location_id: string;
          end_location_id: string | null;
          distance_km: number | null;
          max_speed: number | null;
          avg_speed: number | null;
          fuel_consumed: number | null;
          catch_weight: number | null;
          notes: string | null;
          weather_conditions: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          start_location_id: string;
          end_location_id?: string | null;
          distance_km?: number | null;
          max_speed?: number | null;
          avg_speed?: number | null;
          fuel_consumed?: number | null;
          catch_weight?: number | null;
          notes?: string | null;
          weather_conditions?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          start_location_id?: string;
          end_location_id?: string | null;
          distance_km?: number | null;
          max_speed?: number | null;
          avg_speed?: number | null;
          fuel_consumed?: number | null;
          catch_weight?: number | null;
          notes?: string | null;
          weather_conditions?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          channel_type: 'public' | 'private' | 'emergency' | 'organization';
          created_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          channel_type?: 'public' | 'private' | 'emergency' | 'organization';
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          channel_type?: 'public' | 'private' | 'emergency' | 'organization';
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      weather_data: {
        Row: {
          id: string;
          location: any; // Point geometry
          temperature: number;
          wind_speed: number;
          wind_direction: number;
          wave_height: number;
          visibility: number;
          pressure: number;
          humidity: number;
          condition: string;
          icon: string;
          forecast_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location: any;
          temperature: number;
          wind_speed: number;
          wind_direction: number;
          wave_height: number;
          visibility: number;
          pressure: number;
          humidity: number;
          condition: string;
          icon: string;
          forecast_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location?: any;
          temperature?: number;
          wind_speed?: number;
          wind_direction?: number;
          wave_height?: number;
          visibility?: number;
          pressure?: number;
          humidity?: number;
          condition?: string;
          icon?: string;
          forecast_time?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'fisherman' | 'organization' | 'admin';
      alert_type: 'emergency' | 'zone_violation' | 'weather' | 'system' | 'maintenance';
      alert_severity: 'low' | 'medium' | 'high' | 'critical';
      alert_status: 'active' | 'acknowledged' | 'resolved';
      message_type: 'text' | 'voice' | 'location' | 'image' | 'file';
      zone_type: 'safety' | 'fishing' | 'restricted' | 'navigation';
      channel_type: 'public' | 'private' | 'emergency' | 'organization';
    };
  };
}