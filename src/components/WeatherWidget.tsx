import React, { useEffect, useState } from 'react';
import { Cloud, Wind, Eye, Waves, Thermometer, Compass, Droplets, Gauge, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { weatherService } from '../lib/weatherApi';

const WeatherWidget: React.FC = () => {
  const { weather } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (weather) {
      setLastUpdate(new Date(weather.timestamp));
    }
  }, [weather]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await weatherService.getCurrentWeather();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur actualisation météo:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!weather) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getWeatherConditionColor = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('ensoleillé') || conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'from-yellow-400 to-orange-500';
    }
    if (conditionLower.includes('partiellement') || conditionLower.includes('partly')) {
      return 'from-blue-400 to-cyan-500';
    }
    if (conditionLower.includes('nuageux') || conditionLower.includes('cloudy')) {
      return 'from-gray-400 to-gray-600';
    }
    if (conditionLower.includes('pluie') || conditionLower.includes('rainy')) {
      return 'from-blue-600 to-indigo-700';
    }
    return 'from-blue-500 to-cyan-600';
  };

  const getSeaConditions = (waveHeight: number) => {
    if (waveHeight < 0.5) return { text: 'Mer calme', color: 'text-green-600' };
    if (waveHeight < 1.0) return { text: 'Mer belle', color: 'text-blue-600' };
    if (waveHeight < 1.5) return { text: 'Mer peu agitée', color: 'text-yellow-600' };
    if (waveHeight < 2.0) return { text: 'Mer agitée', color: 'text-orange-600' };
    return { text: 'Mer forte', color: 'text-red-600' };
  };

  const weatherItems = [
    {
      icon: Thermometer,
      label: 'Température',
      value: `${weather.temperature}°C`,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Wind,
      label: 'Vent',
      value: `${weather.windSpeed} kt ${getWindDirection(weather.windDirection)}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Waves,
      label: 'Houle',
      value: `${weather.waveHeight}m`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: Eye,
      label: 'Visibilité',
      value: `${weather.visibility} km`,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Gauge,
      label: 'Pression',
      value: `${Math.round(weather.pressure || 1013)} hPa`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Droplets,
      label: 'Humidité',
      value: `${Math.round(weather.humidity || 75)}%`,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    }
  ];

  const seaConditions = getSeaConditions(weather.waveHeight);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${getWeatherConditionColor(weather.condition)} text-white p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Conditions Météo</h3>
          <div className="flex items-center space-x-2">
            <Cloud className="w-6 h-6 opacity-80" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">{weather.temperature}°C</div>
          <div className="text-sm opacity-90 capitalize mb-2">{weather.condition}</div>
          <div className={`text-sm font-medium ${seaConditions.color} bg-white/20 px-3 py-1 rounded-full inline-block`}>
            {seaConditions.text}
          </div>
          {weather.location && (
            <div className="text-xs opacity-75 mt-2">
              📍 {weather.location.name}
            </div>
          )}
          <div className="text-xs opacity-75 mt-1">
            Mis à jour: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
          </div>
        </div>
      </div>
      
      {/* Weather details grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {weatherItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Wind direction compass */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: weather.windDirection }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute"
                >
                  <Compass className="w-8 h-8 text-blue-500" />
                </motion.div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <span className="text-xs font-medium text-gray-600">
                  {getWindDirection(weather.windDirection)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional marine info */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-600 space-y-1">
              <div>🌊 Conditions de navigation: <span className={`font-medium ${seaConditions.color}`}>{seaConditions.text}</span></div>
              <div>⚓ Recommandation: {weather.waveHeight < 1.5 ? 'Sortie autorisée' : 'Prudence recommandée'}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;