import api from '../lib/djangoApi';

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  file: string;
  file_url: string;
  media_type: 'image' | 'video' | 'document' | 'audio';
  category: 'fishing' | 'boats' | 'ports' | 'weather' | 'events' | 'zones' | 'balises' | 'other';
  size: number;
  file_size_human: string;
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
  uploaded_by: string;
  uploaded_by_name: string;
  is_liked: boolean;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaCollection {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  media_files: MediaFile[];
  created_at: string;
  updated_at: string;
}

export interface MediaStats {
  global: {
    total_files: number;
    total_size: number;
    total_size_human: string;
  };
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  user: {
    files_count: number;
    files_size: number;
    files_size_human: string;
  };
}

class MediaApiService {
  private baseUrl = '/api/media';

  /**
   * Récupère tous les fichiers média
   */
  async getMediaFiles(params?: {
    type?: string;
    category?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<MediaFile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/files/`, { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers média:', error);
      throw error;
    }
  }

  /**
   * Récupère un fichier média par ID
   */
  async getMediaFileById(id: number): Promise<MediaFile> {
    try {
      const response = await api.get(`${this.baseUrl}/files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier média:', error);
      throw error;
    }
  }

  /**
   * Upload un fichier média
   */
  async uploadFile(formData: FormData): Promise<MediaFile> {
    try {
      const response = await api.post(`${this.baseUrl}/files/`, formData, {
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

  /**
   * Upload un fichier média avec callback de progression
   */
  async uploadMediaFile(formData: FormData, onProgress?: (progress: number) => void): Promise<MediaFile> {
    try {
      const response = await api.post(`${this.baseUrl}/files/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  }

  /**
   * Met à jour un fichier média
   */
  async updateMediaFile(id: number, data: Partial<MediaFile>): Promise<MediaFile> {
    try {
      const response = await api.patch(`${this.baseUrl}/files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier média:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier média
   */
  async deleteMediaFile(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/files/${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier média:', error);
      throw error;
    }
  }

  /**
   * Télécharge un fichier média
   */
  async downloadMediaFile(id: string, fileName: string): Promise<void> {
    try {
      const response = await api.get(`${this.baseUrl}/files/${id}/download/`, {
        responseType: 'blob',
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      throw error;
    }
  }

  /**
   * Ajoute un like à un fichier média
   */
  async likeMedia(id: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/files/${id}/like/`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du like:', error);
      throw error;
    }
  }

  /**
   * Retire un like d'un fichier média
   */
  async unlikeMedia(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/files/${id}/like/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du like:', error);
      throw error;
    }
  }

  /**
   * Récupère les commentaires d'un fichier média
   */
  async getComments(id: string): Promise<{ data: any[] }> {
    try {
      const response = await api.get(`${this.baseUrl}/files/${id}/comments/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      throw error;
    }
  }

  /**
   * Ajoute un commentaire à un fichier média
   */
  async addComment(id: string, content: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/files/${id}/comments/`, { content });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des fichiers média
   */
  async getMediaStats(): Promise<MediaStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les collections de médias
   */
  async getMediaCollections(): Promise<MediaCollection[]> {
    try {
      const response = await api.get(`${this.baseUrl}/collections/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle collection de médias
   */
  async createMediaCollection(data: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Promise<MediaCollection> {
    try {
      const response = await api.post(`${this.baseUrl}/collections/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la collection:', error);
      throw error;
    }
  }

  /**
   * Met à jour une collection de médias
   */
  async updateMediaCollection(id: number, data: Partial<MediaCollection>): Promise<MediaCollection> {
    try {
      const response = await api.patch(`${this.baseUrl}/collections/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la collection:', error);
      throw error;
    }
  }

  /**
   * Supprime une collection de médias
   */
  async deleteMediaCollection(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/collections/${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la collection:', error);
      throw error;
    }
  }

  /**
   * Ajoute un fichier à une collection
   */
  async addFileToCollection(collectionId: number, fileId: number, order?: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/collections/${collectionId}/files/`, {
        media_file: fileId,
        order: order || 0,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fichier à la collection:', error);
      throw error;
    }
  }

  /**
   * Retire un fichier d'une collection
   */
  async removeFileFromCollection(collectionId: number, fileId: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/collections/${collectionId}/files/${fileId}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier de la collection:', error);
      throw error;
    }
  }

  /**
   * Recherche des fichiers média
   */
  async searchMediaFiles(query: string, filters?: {
    type?: string;
    category?: string;
    tags?: string[];
    uploaded_by?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<MediaFile[]> {
    try {
      const params = {
        search: query,
        ...filters,
      };
      const response = await api.get(`${this.baseUrl}/files/`, { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers:', error);
      throw error;
    }
  }

  /**
   * Récupère les fichiers média par localisation GPS
   */
  async getMediaFilesByLocation(latitude: number, longitude: number, radius: number = 1000): Promise<MediaFile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/files/`, {
        params: {
          latitude,
          longitude,
          radius,
        },
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers par localisation:', error);
      throw error;
    }
  }

  /**
   * Incrémente le compteur de vues d'un fichier
   */
  async incrementViewCount(id: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/files/${id}/view/`);
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      // Ne pas faire échouer l'opération pour une erreur de compteur
    }
  }

  /**
   * Récupère les fichiers média récents
   */
  async getRecentMediaFiles(limit: number = 10): Promise<MediaFile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/files/`, {
        params: {
          ordering: '-created_at',
          page_size: limit,
        },
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers récents:', error);
      throw error;
    }
  }

  /**
   * Récupère les fichiers média les plus téléchargés
   */
  async getMostDownloadedFiles(limit: number = 10): Promise<MediaFile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/files/`, {
        params: {
          ordering: '-download_count',
          page_size: limit,
        },
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers les plus téléchargés:', error);
      throw error;
    }
  }

  /**
   * Récupère les fichiers média les plus vus
   */
  async getMostViewedFiles(limit: number = 10): Promise<MediaFile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/files/`, {
        params: {
          ordering: '-view_count',
          page_size: limit,
        },
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers les plus vus:', error);
      throw error;
    }
  }
}

export const mediaApiService = new MediaApiService();