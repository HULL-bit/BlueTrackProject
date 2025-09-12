import { API_CONFIG } from '../config/api';

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  file: string;
  media_type: 'image' | 'video' | 'document' | 'audio';
  category: 'fishing' | 'boats' | 'ports' | 'weather' | 'events' | 'zones' | 'balises' | 'other';
  size: number;
  mime_type: string;
  description?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  location_name?: string;
  width?: number;
  height?: number;
  duration?: string;
  is_public: boolean;
  is_downloadable: boolean;
  download_count: number;
  view_count: number;
  like_count: number;
  uploaded_by: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  file_size_human: string;
  file_url: string;
}

export interface MediaStats {
  global: {
    total_files: number;
    total_size: number;
    total_size_human: string;
  };
  by_type: {
    image: number;
    video: number;
    document: number;
    audio: number;
  };
  by_category: {
    fishing: number;
    boats: number;
    ports: number;
    weather: number;
    events: number;
    zones: number;
    balises: number;
    other: number;
  };
  user: {
    files_count: number;
    files_size: number;
    files_size_human: string;
  };
}

export interface MediaUploadData {
  file: File;
  name?: string;
  description?: string;
  tags?: string[];
  category?: string;
  is_public?: boolean;
  is_downloadable?: boolean;
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

class MediaService {
  private baseUrl = API_CONFIG.BASE_URL;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
        headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez vos permissions ou reconnectez-vous.');
      } else if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  private async makeFormRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
        method: 'POST',
        headers: {
        // Ajouter le token seulement s'il existe (upload anonyme autorisé)
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez vos permissions ou reconnectez-vous.');
      } else if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  // Récupérer la liste des fichiers média
  async getMediaFiles(params?: {
    type?: string;
    category?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: MediaFile[]; count: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) searchParams.append('type', params.type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());

    const queryString = searchParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.MEDIA.FILES}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<{ results: MediaFile[]; count: number }>(endpoint);
  }

  // Récupérer un fichier média spécifique
  async getMediaFile(id: string): Promise<MediaFile> {
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.FILE_DETAIL.replace('{id}', id);
    return this.makeRequest<MediaFile>(endpoint);
  }

  // Uploader un fichier média
  async uploadMediaFile(data: MediaUploadData): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.category) formData.append('category', data.category);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.is_downloadable !== undefined) formData.append('is_downloadable', data.is_downloadable.toString());
    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());
    if (data.location_name) formData.append('location_name', data.location_name);

    return this.makeFormRequest<MediaFile>(API_CONFIG.ENDPOINTS.MEDIA.FILES, formData);
  }

  // Supprimer un fichier média
  async deleteMediaFile(id: string): Promise<void> {
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.FILE_DETAIL.replace('{id}', id);
    await this.makeRequest<void>(endpoint, { method: 'DELETE' });
  }

  // Télécharger un fichier média
  async downloadMediaFile(id: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.FILE_DOWNLOAD.replace('{id}', id);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.status}`);
    }

    return response.blob();
  }

  // Ajouter/retirer un like
  async toggleLike(id: string): Promise<{ message: string }> {
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.FILE_LIKE.replace('{id}', id);
    return this.makeRequest<{ message: string }>(endpoint, { method: 'POST' });
  }

  // Récupérer les statistiques
  async getMediaStats(): Promise<MediaStats> {
    return this.makeRequest<MediaStats>(API_CONFIG.ENDPOINTS.MEDIA.STATS);
  }

  // Mettre à jour un fichier média
  async updateMediaFile(id: string, data: Partial<MediaFile>): Promise<MediaFile> {
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.FILE_DETAIL.replace('{id}', id);
    return this.makeRequest<MediaFile>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const mediaService = new MediaService();