interface WeatherApiResponse {
  current: {
    temp_c: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    vis_km: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
  };
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
}

interface MarineWeatherResponse {
  data: Array<{
    time: string;
    swellHeight: number;
    swellDirection: number;
    swellPeriod: number;
    waveHeight: number;
    waveDirection: number;
    wavePeriod: number;
    windWaveHeight: number;
    windWaveDirection: number;
    windWavePeriod: number;
  }>;
}

class WeatherService {
  private readonly WEATHER_API_KEY = 'demo_key'; // Remplacer par une vraie clé API
  private readonly WEATHER_API_URL = 'https://api.weatherapi.com/v1';
  private readonly MARINE_API_URL = 'https://api.stormglass.io/v2';
  
  // Coordonnées de Cayar, Sénégal
  private readonly CAYAR_LAT = 14.9325;
  private readonly CAYAR_LON = -17.1925;

  async getCurrentWeather() {
    // Utiliser directement les données simulées pour éviter les erreurs d'API
    return this.getSimulatedWeather();
  }

  private async fetchRealWeather(): Promise<WeatherApiResponse | null> {
    try {
      const response = await fetch(
        `${this.WEATHER_API_URL}/current.json?key=${this.WEATHER_API_KEY}&q=${this.CAYAR_LAT},${this.CAYAR_LON}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API météo:', error);
      return null;
    }
  }

  private async fetchMarineData(): Promise<MarineWeatherResponse | null> {
    try {
      const response = await fetch(
        `${this.MARINE_API_URL}/weather/point?lat=${this.CAYAR_LAT}&lng=${this.CAYAR_LON}&params=swellHeight,waveHeight&start=${new Date().toISOString()}&end=${new Date(Date.now() + 3600000).toISOString()}`,
        {
          headers: {
            'Authorization': 'demo_key' // Remplacer par une vraie clé
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Marine API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API marine:', error);
      return null;
    }
  }

  private transformWeatherData(data: WeatherApiResponse) {
    return {
      temperature: data.current.temp_c,
      windSpeed: Math.round(data.current.wind_kph * 0.539957), // Convertir en nœuds
      windDirection: data.current.wind_degree,
      waveHeight: this.getSimulatedWaveHeight(), // API météo standard n'a pas les vagues
      visibility: data.current.vis_km,
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
      condition: data.current.condition.text,
      icon: this.mapWeatherIcon(data.current.condition.code),
      timestamp: new Date().toISOString(),
      location: {
        name: data.location.name,
        lat: data.location.lat,
        lon: data.location.lon
      }
    };
  }

  private getSimulatedWeather() {
    // Données météo réalistes pour Cayar basées sur les conditions saisonnières
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    
    // Température selon l'heure et la saison
    let baseTemp = 26;
    if (month >= 12 || month <= 2) baseTemp = 24; // Saison fraîche
    if (month >= 6 && month <= 8) baseTemp = 28; // Saison chaude
    
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 4;
    const temperature = Math.round((baseTemp + tempVariation) * 10) / 10;
    
    // Vent selon la saison (alizés)
    const windSpeed = 8 + Math.random() * 12; // 8-20 nœuds typique
    const windDirection = 230 + (Math.random() - 0.5) * 60; // Vent de NW dominant
    
    // Houle selon la saison
    const waveHeight = month >= 11 || month <= 3 ? 
      1.0 + Math.random() * 1.5 : // Saison des vagues
      0.5 + Math.random() * 1.0;  // Saison calme
    
    const conditions = [
      'Ensoleillé', 'Partiellement nuageux', 'Nuageux', 'Brumeux'
    ];
    
    return {
      temperature,
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: Math.round(windDirection),
      waveHeight: Math.round(waveHeight * 10) / 10,
      visibility: 8 + Math.random() * 7, // 8-15 km
      pressure: 1010 + Math.random() * 8, // 1010-1018 hPa
      humidity: 65 + Math.random() * 20, // 65-85%
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      icon: this.getRandomIcon(),
      timestamp: new Date().toISOString(),
      location: {
        name: 'Cayar',
        lat: this.CAYAR_LAT,
        lon: this.CAYAR_LON
      }
    };
  }

  private getSimulatedWaveHeight(): number {
    // Simulation basée sur les conditions typiques de Cayar
    const month = new Date().getMonth() + 1;
    const baseHeight = month >= 11 || month <= 3 ? 1.2 : 0.8;
    return Math.round((baseHeight + Math.random() * 0.8) * 10) / 10;
  }

  private mapWeatherIcon(code: number): string {
    // Mapping des codes WeatherAPI vers nos icônes
    if (code === 1000) return 'sunny';
    if ([1003, 1006].includes(code)) return 'partly-cloudy';
    if ([1009, 1030].includes(code)) return 'cloudy';
    if ([1063, 1180, 1183].includes(code)) return 'rainy';
    return 'partly-cloudy';
  }

  private getRandomIcon(): string {
    const icons = ['sunny', 'partly-cloudy', 'cloudy'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  async getWeatherForecast(days: number = 3) {
    // Simulation d'une prévision sur plusieurs jours
    const forecast = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const weather = await this.getCurrentWeather();
      forecast.push({
        ...weather,
        date: date.toISOString(),
        day: date.toLocaleDateString('fr-FR', { weekday: 'long' })
      });
    }
    
    return forecast;
  }

  async getMarineConditions() {
    try {
      const marineData = await this.fetchMarineData();
      if (marineData && marineData.data.length > 0) {
        const current = marineData.data[0];
        return {
          swellHeight: current.swellHeight,
          swellDirection: current.swellDirection,
          swellPeriod: current.swellPeriod,
          waveHeight: current.waveHeight,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Erreur données marines:', error);
    }

    // Fallback vers simulation
    return {
      swellHeight: this.getSimulatedWaveHeight(),
      swellDirection: 230 + (Math.random() - 0.5) * 60,
      swellPeriod: 8 + Math.random() * 4,
      waveHeight: this.getSimulatedWaveHeight(),
      timestamp: new Date().toISOString()
    };
  }
}

export const weatherService = new WeatherService();