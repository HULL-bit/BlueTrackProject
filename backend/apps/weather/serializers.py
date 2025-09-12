from rest_framework import serializers
from .models import WeatherData

class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = ['id', 'latitude', 'longitude', 'temperature', 'wind_speed', 
                 'wind_direction', 'wave_height', 'visibility', 'pressure', 
                 'humidity', 'condition', 'icon', 'forecast_time', 'created_at']
        read_only_fields = ['id', 'created_at']