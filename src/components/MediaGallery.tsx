import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  FileImage, 
  Download, 
  Trash2, 
  Plus, 
  Eye,
  Search,
  Grid,
  List,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Play,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mediaService, MediaFile, MediaStats } from '../services/mediaService';

// Utiliser les interfaces du service mediaService
type MediaItem = MediaFile;

const MediaGallery: React.FC = () => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMediaItems();
    loadStats();
  }, []);

  useEffect(() => {
    filterMediaItems();
  }, [mediaItems, searchTerm, filterType, filterCategory]);

  const loadMediaItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaService.getMediaFiles();
      // Filtrer pour exclure les images de pirogues
      const filteredResults = response.results.filter(item => 
        !item.tags?.includes('pirogue') && 
        !item.tags?.includes('vessel') &&
        !item.description?.toLowerCase().includes('pirogue') &&
        !item.name?.toLowerCase().includes('pirogue')
      );
      setMediaItems(filteredResults);
    } catch (err) {
      console.error('Erreur lors du chargement des médias:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await mediaService.getMediaStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const filterMediaItems = () => {
    let filtered = mediaItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || item.media_type === filterType;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
    setFilteredItems(filtered);
  };

  // Les statistiques sont maintenant chargées depuis l'API

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const uploadData = {
          file: file,
          name: file.name,
          description: `Fichier uploadé par ${user?.username || 'Utilisateur anonyme'}`,
          tags: [],
          category: 'other' as const,
          is_public: true,
          is_downloadable: true,
        };

        const newMedia = await mediaService.uploadMediaFile(uploadData);
        
        // Ajouter le nouveau média à la liste
        setMediaItems(prev => [newMedia, ...prev]);
      }
      
      // Recharger les statistiques
      await loadStats();
    } catch (err) {
      console.error('Erreur upload:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload du fichier';
      setError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await mediaService.deleteMediaFile(itemId);
    const updatedItems = mediaItems.filter(item => item.id !== itemId);
    setMediaItems(updatedItems);
    setSelectedItems(prev => prev.filter(id => id !== itemId));
      await loadStats();
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du fichier');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      // Supprimer tous les éléments sélectionnés
      await Promise.all(selectedItems.map(id => mediaService.deleteMediaFile(id)));
    
    const updatedItems = mediaItems.filter(item => !selectedItems.includes(item.id));
    setMediaItems(updatedItems);
    setSelectedItems([]);
      await loadStats();
    } catch (err) {
      console.error('Erreur suppression en lot:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression des fichiers');
    }
  };

  const handleClearAll = async () => {
    if (mediaItems.length === 0) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer toutes les ${mediaItems.length} images/vidéos de la galerie ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;
    
    try {
      setUploading(true);
      // Supprimer tous les éléments
      await Promise.all(mediaItems.map(item => mediaService.deleteMediaFile(item.id)));
      
      setMediaItems([]);
      setSelectedItems([]);
      await loadStats();
    } catch (err) {
      console.error('Erreur suppression complète:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de tous les fichiers');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item: MediaItem) => {
    try {
      const blob = await mediaService.downloadMediaFile(item.id);
      const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
      link.href = url;
      link.download = item.original_name || item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setError('Erreur lors du téléchargement du fichier');
    }
  };

  const handleLike = async (itemId: string) => {
    try {
      await mediaService.toggleLike(itemId);
      // Recharger les médias pour avoir les données à jour
      await loadMediaItems();
    } catch (err) {
      console.error('Erreur like:', err);
      setError('Erreur lors de l\'ajout du like');
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'audio': return <FileText className="w-4 h-4" />;
      default: return <FileImage className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'fishing': return 'bg-blue-100 text-blue-800';
      case 'boats': return 'bg-green-100 text-green-800';
      case 'ports': return 'bg-purple-100 text-purple-800';
      case 'weather': return 'bg-orange-100 text-orange-800';
      case 'events': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Galerie Média</h1>
        <p className="text-gray-600">Partagez et visualisez les photos, vidéos et documents de la communauté</p>
        
        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Fermer
            </button>
          </div>
        )}
        
        {/* Indicateur de chargement */}
        {loading && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <p>Chargement des médias...</p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Médias</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.global.total_files || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileImage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-green-600">{stats?.by_type.image || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vidéos</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.by_type.video || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Espace Utilisé</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.global.total_size_human || '0 MB'}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans la galerie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="image">Images</option>
            <option value="video">Vidéos</option>
            <option value="document">Documents</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes catégories</option>
            <option value="fishing">Pêche</option>
            <option value="boats">Bateaux</option>
            <option value="ports">Ports</option>
            <option value="weather">Météo</option>
            <option value="events">Événements</option>
            <option value="other">Autres</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{uploading ? 'Upload...' : 'Ajouter des fichiers'}</span>
          </motion.button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Actions en lot */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.length} élément(s) sélectionné(s)
            </span>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center space-x-2"
                disabled={mediaItems.length === 0 || uploading}
              >
                <Trash2 className="w-4 h-4" />
                <span>Vider la galerie</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Grille des médias */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}
          >
            {viewMode === 'grid' ? (
              <div className="relative group">
                {item.media_type === 'image' ? (
                  <img
                    src={item.file_url?.startsWith('http') ? item.file_url : `http://localhost:8000${item.file_url}`}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Erreur chargement image:', item.file_url);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNTMuMzcyNiAxMDAgNDggOTQuNjI3NCA0OCA4OEM0OCA4MS4zNzI2IDUzLjM3MjYgNzYgNjAgNzZDNjYuNjI3NCA3NiA3MiA4MS4zNzI2IDcyIDg4QzcyIDk0LjYyNzQgNjYuNjI3NCAxMDAgNjAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDg4QzE1MiA5NC42Mjc0IDE0Ni42MjcgMTAwIDE0MCAxMDBDMTMzLjM3MyAxMDAgMTI4IDk0LjYyNzQgMTI4IDg4QzEyOCA4MS4zNzI2IDEzMy4zNzMgNzYgMTQwIDc2QzE0Ni42MjcgNzYgMTUyIDgxLjM3MjYgMTUyIDg4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDEyOEMxNTIgMTM0LjYyNyAxNDYuNjI3IDE0MCAxNDAgMTQwQzEzMy4zNzMgMTQwIDEyOCAxMzQuNjI3IDEyOCAxMjhDMTI4IDEyMS4zNzMgMTMzLjM3MyAxMTYgMTQwIDExNkMxNDYuNjI3IDExNiAxNTIgMTIxLjM3MyAxNTIgMTI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTQwQzUzLjM3MjYgMTQwIDQ4IDEzNC42MjcgNDggMTI4QzQ4IDEyMS4zNzMgNTMuMzcyNiAxMTYgNjAgMTE2QzY2LjYyNzQgMTE2IDcyIDEyMS4zNzMgNzIgMTI4QzcyIDEzNC42MjcgNjYuNjI3NCAxNDAgNjAgMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : item.media_type === 'video' ? (
                  <div className="relative">
                    <video
                      src={item.file_url?.startsWith('http') ? item.file_url : `http://localhost:8000${item.file_url}`}
                      className="w-full h-48 object-cover"
                      controls
                      preload="metadata"
                      onError={(e) => {
                        console.error('Erreur chargement vidéo:', item.file_url);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 w-full h-48 bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedMedia(item);
                        setShowDetails(true);
                      }}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDownload(item)}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(item.id)}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-4 w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.media_type === 'image' ? (
                    <img
                      src={item.file_url?.startsWith('http') ? item.file_url : `http://localhost:8000${item.file_url}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{display: item.media_type === 'image' ? 'none' : 'flex'}}>
                    {getTypeIcon(item.media_type)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">{item.file_size_human}</span>
                    <span className="text-xs text-gray-500">{item.uploaded_by?.username || 'Utilisateur anonyme'}</span>
                    <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(item)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                {item.category && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                )}
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>{item.uploaded_by?.username || 'Utilisateur anonyme'}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{item.like_count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.view_count || 0}</span>
                  </span>
                </div>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun média trouvé</h3>
          <p className="text-gray-600">Aucun média ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails du Média</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedMedia.media_type === 'image' ? (
                      <img
                        src={selectedMedia.file_url}
                        alt={selectedMedia.name}
                        className="w-full rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNTMuMzcyNiAxMDAgNDggOTQuNjI3NCA0OCA4OEM0OCA4MS4zNzI2IDUzLjM3MjYgNzYgNjAgNzZDNjYuNjI3NCA3NiA3MiA4MS4zNzI2IDcyIDg4QzcyIDk0LjYyNzQgNjYuNjI3NCAxMDAgNjAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDg4QzE1MiA5NC42Mjc0IDE0Ni42MjcgMTAwIDE0MCAxMDBDMTMzLjM3MyAxMDAgMTI4IDk0LjYyNzQgMTI4IDg4QzEyOCA4MS4zNzI2IDEzMy4zNzMgNzYgMTQwIDc2QzE0Ni42MjcgNzYgMTUyIDgxLjM3MjYgMTUyIDg4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDEyOEMxNTIgMTM0LjYyNyAxNDYuNjI3IDE0MCAxNDAgMTQwQzEzMy4zNzMgMTQwIDEyOCAxMzQuNjI3IDEyOCAxMjhDMTI4IDEyMS4zNzMgMTMzLjM3MyAxMTYgMTQwIDExNkMxNDYuNjI3IDExNiAxNTIgMTIxLjM3MyAxNTIgMTI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTQwQzUzLjM3MjYgMTQwIDQ4IDEzNC42MjcgNDggMTI4QzQ4IDEyMS4zNzMgNTMuMzcyNiAxMTYgNjAgMTE2QzY2LjYyNzQgMTE2IDcyIDEyMS4zNzMgNzIgMTI4QzcyIDEzNC42MjcgNjYuNjI3NCAxNDAgNjAgMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : selectedMedia.media_type === 'video' ? (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900">{selectedMedia.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedMedia.description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Uploadé par</label>
                        <p className="text-gray-900">{selectedMedia.uploaded_by?.username || 'Utilisateur anonyme'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date</label>
                        <p className="text-gray-900">{new Date(selectedMedia.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Taille</label>
                        <p className="text-gray-900">{selectedMedia.file_size_human}</p>
                      </div>
                      {selectedMedia.location_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Localisation</label>
                          <p className="text-gray-900">{selectedMedia.location_name}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.tags?.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            #{tag}
                          </span>
                        )) || <span className="text-gray-500">Aucun tag</span>}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(selectedMedia)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLike(selectedMedia.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{selectedMedia.like_count || 0}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;