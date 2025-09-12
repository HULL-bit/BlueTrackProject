import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Gift, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Eye,
  EyeOff,
  Plus,
  DollarSign,
  Package,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Donation {
  id: number;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  donor_organization?: string;
  donation_type: 'financial' | 'equipment' | 'service' | 'other';
  amount?: number;
  description: string;
  purpose?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  is_anonymous: boolean;
  is_public: boolean;
  created_at: string;
  display_name: string;
  display_organization?: string;
}

interface DonationGoal {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  remaining_amount: number;
  is_active: boolean;
  deadline?: string;
}

interface DonationStats {
  total_donations: number;
  total_amount: number;
  recent_donations: number;
  recent_amount: number;
  active_goals: DonationGoal[];
}

const DonationPanel: React.FC = () => {
  const { user } = useAuth();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // État du formulaire de donation
  const [donationForm, setDonationForm] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    donor_organization: '',
    donation_type: 'financial' as const,
    amount: '',
    description: '',
    purpose: '',
    is_anonymous: false,
    is_public: true
  });

  useEffect(() => {
    loadDonations();
    loadStats();
  }, []);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('http://localhost:8000/api/donations/public/');
      if (response.ok) {
        const data = await response.json();
        setDonations(data.results || data);
      } else {
        const errorData = await response.json();
        console.error('Erreur API donations:', errorData);
        setError(`Erreur ${response.status}: ${errorData.detail || 'Erreur lors du chargement des donations'}`);
      }
    } catch (error) {
      console.error('Erreur chargement donations:', error);
      setError('Erreur de connexion lors du chargement des donations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/donations/stats/');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        console.error('Erreur API stats:', errorData);
        setError(`Erreur ${response.status}: ${errorData.detail || 'Erreur lors du chargement des statistiques'}`);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setError('Erreur de connexion lors du chargement des statistiques');
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/donations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...donationForm,
          amount: donationForm.amount ? parseFloat(donationForm.amount) : null
        }),
      });

      if (response.ok) {
        setSuccess('Merci pour votre donation ! Elle sera traitée dans les plus brefs délais.');
        setDonationForm({
          donor_name: '',
          donor_email: '',
          donor_phone: '',
          donor_organization: '',
          donation_type: 'financial',
          amount: '',
          description: '',
          purpose: '',
          is_anonymous: false,
          is_public: true
        });
        setShowDonationForm(false);
        loadDonations();
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'envoi de la donation');
      }
    } catch (error) {
      console.error('Erreur envoi donation:', error);
      setError('Erreur lors de l\'envoi de la donation');
    } finally {
      setIsLoading(false);
    }
  };

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'equipment': return <Package className="w-4 h-4" />;
      case 'service': return <Wrench className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getDonationTypeLabel = (type: string) => {
    switch (type) {
      case 'financial': return 'Don financier';
      case 'equipment': return 'Équipement';
      case 'service': return 'Service';
      default: return 'Autre';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-primary-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Non financier';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Soutenir Blue-Track</h2>
              <p className="text-primary-100">Aidez-nous à protéger les vies en mer</p>
            </div>
          </div>
          <button
            onClick={() => setShowDonationForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Faire un don</span>
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm text-primary-100">Total donateurs</span>
              </div>
              <div className="text-2xl font-bold">{stats.total_donations}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm text-primary-100">Montant total</span>
              </div>
              <div className="text-2xl font-bold">{formatAmount(stats.total_amount)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm text-primary-100">Ce mois</span>
              </div>
              <div className="text-2xl font-bold">{stats.recent_donations}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm text-primary-100">Objectifs actifs</span>
              </div>
              <div className="text-2xl font-bold">{stats.active_goals.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Objectifs de donation */}
      {stats?.active_goals && stats.active_goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary-600" />
            <span>Nos objectifs</span>
          </h3>
          <div className="space-y-4">
            {stats.active_goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                  <span className="text-sm text-gray-500">
                    {goal.progress_percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatAmount(goal.current_amount)} collectés</span>
                  <span>Objectif: {formatAmount(goal.target_amount)}</span>
                </div>
                {goal.deadline && (
                  <div className="text-xs text-gray-500 mt-2">
                    Échéance: {formatDate(goal.deadline)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des donations récentes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Gift className="w-5 h-5 text-primary-600" />
          <span>Donations récentes</span>
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : donations.length > 0 ? (
          <div className="space-y-3">
            {donations.slice(0, 10).map((donation) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-primary-600">
                    {getDonationTypeIcon(donation.donation_type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {donation.display_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getDonationTypeLabel(donation.donation_type)} • {formatDate(donation.created_at)}
                    </div>
                    {donation.display_organization && (
                      <div className="text-xs text-gray-500">
                        {donation.display_organization}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatAmount(donation.amount)}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      {getStatusIcon(donation.status)}
                      <span className="capitalize">{donation.status}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune donation publique pour le moment</p>
          </div>
        )}
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {/* Modal de donation */}
      <AnimatePresence>
        {showDonationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDonationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Faire un don à Blue-Track</span>
                  </h2>
                  <button
                    onClick={() => setShowDonationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleDonationSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={donationForm.donor_name}
                      onChange={(e) => setDonationForm({...donationForm, donor_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      required
                      disabled={donationForm.is_anonymous}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={donationForm.donor_email}
                      onChange={(e) => setDonationForm({...donationForm, donor_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      required
                      disabled={donationForm.is_anonymous}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={donationForm.donor_phone}
                      onChange={(e) => setDonationForm({...donationForm, donor_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      disabled={donationForm.is_anonymous}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Organisation
                    </label>
                    <input
                      type="text"
                      value={donationForm.donor_organization}
                      onChange={(e) => setDonationForm({...donationForm, donor_organization: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      disabled={donationForm.is_anonymous}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Type de donation *
                  </label>
                  <select
                    value={donationForm.donation_type}
                    onChange={(e) => setDonationForm({...donationForm, donation_type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="financial">Don financier</option>
                    <option value="equipment">Équipement</option>
                    <option value="service">Service</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                {donationForm.donation_type === 'financial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Montant (FCFA)
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                      placeholder="0"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description de votre donation *
                  </label>
                  <textarea
                    value={donationForm.description}
                    onChange={(e) => setDonationForm({...donationForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                    placeholder="Décrivez votre donation..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Objectif (optionnel)
                  </label>
                  <textarea
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm({...donationForm, purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Comment souhaitez-vous que votre donation soit utilisée ?"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={donationForm.is_anonymous}
                      onChange={(e) => setDonationForm({...donationForm, is_anonymous: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900">Don anonyme</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={donationForm.is_public}
                      onChange={(e) => setDonationForm({...donationForm, is_public: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900">Autoriser l'affichage public</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDonationForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        <span>Envoyer le don</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationPanel;

