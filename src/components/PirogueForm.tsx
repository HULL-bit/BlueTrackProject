import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, 
  Upload, 
  X, 
  Camera, 
  MapPin, 
  User, 
  Phone, 
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { pirogueImages, imageUtils } from '../assets/images';
// import { mediaService } from '../services/mediaService'; // Pas utilisé pour les images de pirogues

interface PirogueFormData {
  name: string;
  owner: string;
  phone: string;
  licenseNumber: string;
  location: string;
  description: string;
  images: File[];
  selectedImageUrl?: string;
}

interface PirogueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PirogueFormData) => Promise<void>;
  editingPirogue?: any;
}

const PirogueForm: React.FC<PirogueFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPirogue 
}) => {
  const [formData, setFormData] = useState<PirogueFormData>({
    name: editingPirogue?.name || '',
    owner: editingPirogue?.owner || '',
    phone: editingPirogue?.phone || '',
    licenseNumber: editingPirogue?.licenseNumber || '',
    location: editingPirogue?.location || '',
    description: editingPirogue?.description || '',
    images: [],
    selectedImageUrl: editingPirogue?.imageUrl || pirogueImages[0].url
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: keyof PirogueFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, selectedImageUrl: imageUrl }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB max
    );

    if (validFiles.length !== fileArray.length) {
      setError('Certains fichiers ne sont pas des images valides ou sont trop volumineux (max 5MB)');
    }

    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...validFiles].slice(0, 5) // Max 5 images
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom de la pirogue est requis');
      return;
    }

    if (!formData.owner.trim()) {
      setError('Le nom du propriétaire est requis');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    try {
      setIsLoading(true);
      
      // Sauvegarder les images si il y en a (localement, pas dans le dossier média)
      if (formData.images.length > 0) {
        try {
          // Convertir les images en base64 pour stockage local
          const imageUrls = [];
          for (const imageFile of formData.images) {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(imageFile);
            });
            
            const base64Url = await base64Promise;
            imageUrls.push(base64Url);
          }
          
          // Utiliser la première image comme image principale
          formData.selectedImageUrl = imageUrls[0];
        } catch (imageError) {
          console.error('Erreur lors de la conversion des images:', imageError);
          // En cas d'erreur, utiliser l'image locale temporairement
          formData.selectedImageUrl = formData.images[0];
        }
      }

      await onSave(formData);
      setSuccess('Pirogue sauvegardée avec succès');
      
      // Reset form
      setFormData({
        name: '',
        owner: '',
        phone: '',
        licenseNumber: '',
        location: '',
        description: '',
        images: [],
        selectedImageUrl: pirogueImages[0].url
      });
      
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur sauvegarde pirogue:', error);
      setError('Erreur lors de la sauvegarde de la pirogue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {editingPirogue ? 'Modifier la Pirogue' : 'Ajouter une Pirogue'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Informations de la pirogue artisanale sénégalaise
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Messages d'état */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">{success}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Informations de Base</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la pirogue *
                    </label>
                    <div className="relative">
                      <Ship className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Ex: Ndakaaru, Jambaar, etc."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Propriétaire *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.owner}
                        onChange={(e) => handleInputChange('owner', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Nom du propriétaire"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="+221 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de licence
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Ex: SN-CAY-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Ex: Cayar, Dakar, Saint-Louis..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      rows={3}
                      placeholder="Description de la pirogue..."
                    />
                  </div>
                </div>

                {/* Images et photos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>Images de la Pirogue</span>
                  </h3>

                  {/* Image sélectionnée */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image principale
                    </label>
                    <div className="relative">
                      <img
                        src={formData.selectedImageUrl}
                        alt="Pirogue sélectionnée"
                        className="w-full h-48 object-cover rounded-xl border border-gray-300"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Cliquer pour changer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Galerie d'images disponibles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choisir une image de pirogue sénégalaise
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {pirogueImages.slice(0, 6).map((image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => handleImageSelect(image.url)}
                          className={`relative w-full h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            formData.selectedImageUrl === image.url
                              ? 'border-blue-500 ring-2 ring-blue-500/20'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={imageUtils.optimizeImageUrl(image.url, 100, 100)}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload de fichiers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter vos propres photos
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Glissez-déposez vos images ici ou
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
                      >
                        Parcourir
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Max 5 images, 5MB par image
                      </p>
                    </div>
                  </div>

                  {/* Images uploadées */}
                  {formData.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images uploadées ({formData.images.length}/5)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingPirogue ? 'Mettre à jour' : 'Sauvegarder'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PirogueForm;
