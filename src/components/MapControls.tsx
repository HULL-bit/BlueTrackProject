import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Eye, 
  EyeOff,
  Filter,
  RefreshCw
} from 'lucide-react';

interface MapControlsProps {
  onRefresh?: () => void;
  showBalises?: boolean;
  showZones?: boolean;
  onToggleBalises?: (show: boolean) => void;
  onToggleZones?: (show: boolean) => void;
  className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({
  onRefresh,
  showBalises = true,
  showZones = true,
  onToggleBalises,
  onToggleZones,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <div className={`absolute top-4 right-4 z-[1000] flex flex-col space-y-2 ${className}`}>
        {/* Bouton de rafraîchissement */}
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-3 bg-white shadow-lg rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        )}

        {/* Bouton de filtres */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 shadow-lg rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:text-blue-600'
          }`}
          title="Filtres et options"
        >
          <Filter className="w-5 h-5" />
        </motion.button>

        {/* Panneau de filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]"
          >
            <h3 className="font-medium text-gray-900 mb-3">Affichage</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showBalises}
                  onChange={(e) => onToggleBalises?.(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Balises GPS</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(e) => onToggleZones?.(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Zones Marines</span>
              </label>
            </div>
          </motion.div>
        )}

      </div>
    </>
  );
};

export default MapControls;
