import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, MapPin, X, Users, AlertTriangle, Cloud, Anchor, Minimize2, Maximize2, Image, Upload, Mic, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, updateLocation, users } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChannel, setActiveChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  const channels = [
    { id: 'general', name: 'Général', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'emergency', name: 'Urgences', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'weather', name: 'Météo', icon: Cloud, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'coordination', name: 'Coordination', icon: Anchor, color: 'text-green-600', bgColor: 'bg-green-50' }
  ];

  const channelMessages = messages.filter(msg => 
    msg.channelId === activeChannel || (!msg.channelId && activeChannel === 'general')
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  useEffect(() => {
    const unread = messages.filter(msg => 
      !msg.isRead && msg.senderId !== user?.id
    ).length;
    setUnreadCount(unread);
  }, [messages, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await sendMessage({
      senderId: user.id,
      channelId: activeChannel,
      content: newMessage,
      type: 'text'
    });

    setNewMessage('');
  };

  const handleShareLocation = async () => {
    if (!user) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationMessage = `📍 Position partagée: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          
          await sendMessage({
            senderId: user.id,
            channelId: activeChannel,
            content: locationMessage,
            type: 'location',
            metadata: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });

          // Mettre à jour la position dans le système
          await updateLocation({
            userId: user.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0
          });
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          alert('Impossible d\'obtenir votre position');
        }
      );
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('channel_id', activeChannel);
      
      const response = await fetch('http://localhost:8000/api/communication/upload-image/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
      
      const result = await response.json();
      console.log('Image uploadée avec succès:', result);
      
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 10MB)');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        // Ici vous pouvez envoyer l'audio au serveur
        console.log('Audio enregistré:', audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur enregistrement audio:', error);
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <>
      {/* Chat button flottant style WhatsApp */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-48 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-3xl transition-all duration-300 hover:from-green-600 hover:to-green-700"
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat widget amélioré */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[32rem]'
            }`}
          >
            {/* Header amélioré */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Communication</h3>
                  <p className="text-xs opacity-90">
                    {channels.find(c => c.id === activeChannel)?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Channel tabs améliorés */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {channels.map((channel) => {
                      const Icon = channel.icon;
                      const isActive = activeChannel === channel.id;
                      
                      return (
                        <motion.button
                          key={channel.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveChannel(channel.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            isActive 
                              ? 'bg-white text-green-600 shadow-md' 
                              : 'text-gray-600 hover:bg-white/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{channel.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages améliorés */}
                <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3 bg-gray-50">
                  {channelMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">Aucun message dans ce canal</p>
                      <p className="text-xs">Commencez la conversation !</p>
                    </div>
                  ) : (
                    channelMessages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      const sender = users.find(u => u.id === message.senderId);
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                              isOwn 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                              {!isOwn && (
                                <p className="text-xs font-medium mb-1 opacity-75">
                                  {sender?.profile?.fullName || 'Utilisateur'}
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              
                              {/* Affichage des images */}
                              {message.type === 'image' && message.imageUrl && (
                                <div className="mt-3">
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Image partagée"
                                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(message.imageUrl, '_blank')}
                                  />
                                </div>
                              )}
                              
                              {message.type === 'location' && message.metadata && (
                                <div className="mt-3 pt-2 border-t border-white/20">
                                  <div className="flex items-center space-x-2 text-xs">
                                    <MapPin className="w-3 h-3" />
                                    <span>Position partagée</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className={`text-xs mt-2 ${isOwn ? 'text-right' : 'text-left'} text-gray-500`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input amélioré style WhatsApp */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      title="Émojis"
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={triggerImageUpload}
                      disabled={isUploading}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                      title="Partager une image"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Paperclip className="w-5 h-5" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShareLocation}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      title="Partager ma position"
                    >
                      <MapPin className="w-5 h-5" />
                    </motion.button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-gray-50"
                    />
                    
                    {newMessage.trim() ? (
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseDown={startVoiceRecording}
                        onMouseUp={stopVoiceRecording}
                        onMouseLeave={stopVoiceRecording}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isRecording 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Enregistrer un message vocal"
                      >
                        <Mic className="w-5 h-5" />
                      </motion.button>
                    )}
                  </form>
                  
                  {/* Input file caché pour l'upload d'images */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;