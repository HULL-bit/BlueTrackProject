import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Calendar, Clock, MapPin, Users, Search, Download, Eye } from 'lucide-react';

interface HistoryFilter {
  startDate: string;
  endDate: string;
  type: 'all' | 'trips' | 'alerts' | 'messages' | 'locations';
  status: 'all' | 'completed' | 'active' | 'cancelled';
}

const HistoryManagement: React.FC = () => {
  const { trips, alerts, messages, locations } = useData();
  const [filteredData, setFilteredData] = useState<Array<{
    type: string;
    displayDate: string;
    [key: string]: any;
  }>>([]);
  const [filter, setFilter] = useState<HistoryFilter>({
    startDate: '',
    endDate: '',
    type: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    type: string;
    displayDate: string;
    [key: string]: any;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);



  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, trips, alerts, messages, locations]);

  const applyFilters = () => {
    let data: Array<{
      type: string;
      displayDate: string;
      [key: string]: any;
    }> = [];

    // Combiner tous les types de données
    if (filter.type === 'all' || filter.type === 'trips') {
      data.push(...trips.map(trip => ({ ...trip, type: 'trip', displayDate: trip.startTime })));
    }
    if (filter.type === 'all' || filter.type === 'alerts') {
      data.push(...alerts.map(alert => ({ ...alert, type: 'alert', displayDate: alert.createdAt })));
    }
    if (filter.type === 'all' || filter.type === 'messages') {
      data.push(...messages.map(message => ({ ...message, type: 'message', displayDate: message.timestamp })));
    }
    if (filter.type === 'all' || filter.type === 'locations') {
      data.push(...locations.map(location => ({ ...location, type: 'location', displayDate: location.timestamp })));
    }

    // Filtrer par date
    if (filter.startDate) {
      data = data.filter(item => new Date(item.displayDate) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      data = data.filter(item => new Date(item.displayDate) <= new Date(filter.endDate));
    }

    // Filtrer par statut
    if (filter.status !== 'all') {
      data = data.filter(item => {
        if (item.type === 'trip') return item.status === filter.status;
        if (item.type === 'alert') return item.status === filter.status;
        if (item.type === 'message') return item.isRead === (filter.status === 'completed');
        return true;
      });
    }

    // Filtrer par recherche
    if (searchTerm) {
      data = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (item.type === 'trip') {
          return item.destination?.toLowerCase().includes(searchLower) ||
                 item.captain?.toLowerCase().includes(searchLower);
        }
        if (item.type === 'alert') {
          return item.message?.toLowerCase().includes(searchLower) ||
                 item.type?.toLowerCase().includes(searchLower);
        }
        if (item.type === 'message') {
          return item.content?.toLowerCase().includes(searchLower) ||
                 item.sender?.toLowerCase().includes(searchLower);
        }
        if (item.type === 'location') {
          return item.vesselName?.toLowerCase().includes(searchLower);
        }
        return false;
      });
    }

    // Trier par date (plus récent en premier)
    data.sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());

    setFilteredData(data);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trip': return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'alert': return <Clock className="w-4 h-4 text-red-600" />;
      case 'message': return <Users className="w-4 h-4 text-green-600" />;
      case 'location': return <MapPin className="w-4 h-4 text-purple-600" />;
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trip': return 'Trajet';
      case 'alert': return 'Alerte';
      case 'message': return 'Message';
      case 'location': return 'Position';
      default: return 'Autre';
    }
  };

  const getStatusColor = (item: any) => {
    if (item.type === 'trip') {
      switch (item.status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    if (item.type === 'alert') {
      switch (item.status) {
        case 'active': return 'bg-red-100 text-red-800';
        case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    if (item.type === 'message') {
      return item.isRead ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (item: any) => {
    if (item.type === 'trip') {
      switch (item.status) {
        case 'completed': return 'Terminé';
        case 'active': return 'En cours';
        case 'cancelled': return 'Annulé';
        default: return 'Inconnu';
      }
    }
    if (item.type === 'alert') {
      switch (item.status) {
        case 'active': return 'Active';
        case 'acknowledged': return 'Reconnue';
        case 'resolved': return 'Résolue';
        default: return 'Inconnu';
      }
    }
    if (item.type === 'message') {
      return item.isRead ? 'Lu' : 'Non lu';
    }
    return 'Inconnu';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Type', 'Date', 'Statut', 'Détails'].join(','),
      ...filteredData.map(item => [
        getTypeLabel(item.type),
        formatDate(item.displayDate),
        getStatusLabel(item),
        item.type === 'trip' ? item.destination : 
        item.type === 'alert' ? item.message :
        item.type === 'message' ? item.content :
        item.type === 'location' ? item.vesselName : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const showItemDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion de l'Historique</h2>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 inline mr-2" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="trips">Trajets</option>
              <option value="alerts">Alertes</option>
              <option value="messages">Messages</option>
              <option value="locations">Positions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminé/Complété</option>
              <option value="active">Actif/En cours</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {filteredData.length} résultat(s) trouvé(s)
        </p>
      </div>

      {/* Liste des éléments */}
      <div className="space-y-3">
        {filteredData.map((item, index) => (
          <div
            key={`${item.type}-${item.id || index}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => showItemDetails(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(item.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {item.type === 'trip' ? item.destination :
                       item.type === 'alert' ? item.message?.substring(0, 50) + '...' :
                       item.type === 'message' ? item.content?.substring(0, 50) + '...' :
                       item.type === 'location' ? item.vesselName : 'Élément'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item)}`}>
                      {getStatusLabel(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.displayDate)}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Aucun élément trouvé</p>
          <p className="text-sm">Aucun élément ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                Détails - {getTypeLabel(selectedItem.type)}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-gray-900">{getTypeLabel(selectedItem.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">{formatDate(selectedItem.displayDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Statut</p>
                  <p className="text-gray-900">{getStatusLabel(selectedItem)}</p>
                </div>
              </div>
              
              {selectedItem.type === 'trip' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Détails du trajet</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Destination:</strong> {selectedItem.destination}</p>
                    <p><strong>Capitaine:</strong> {selectedItem.captain}</p>
                    <p><strong>Date de début:</strong> {selectedItem.startDate}</p>
                    <p><strong>Date de fin:</strong> {selectedItem.endDate}</p>
                  </div>
                </div>
              )}
              
              {selectedItem.type === 'alert' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Détails de l'alerte</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Message:</strong> {selectedItem.message}</p>
                    <p><strong>Type:</strong> {selectedItem.type}</p>
                    <p><strong>Priorité:</strong> {selectedItem.priority}</p>
                  </div>
                </div>
              )}
              
              {selectedItem.type === 'message' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Détails du message</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Contenu:</strong> {selectedItem.content}</p>
                    <p><strong>Expéditeur:</strong> {selectedItem.sender}</p>
                    <p><strong>Destinataire:</strong> {selectedItem.recipient}</p>
                  </div>
                </div>
              )}
              
              {selectedItem.type === 'location' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Détails de la position</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Navire:</strong> {selectedItem.vesselName}</p>
                    <p><strong>Latitude:</strong> {selectedItem.latitude}</p>
                    <p><strong>Longitude:</strong> {selectedItem.longitude}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryManagement;