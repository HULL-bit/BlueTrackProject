from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import WeatherData
from .serializers import WeatherDataSerializer

class WeatherDataListView(generics.ListAPIView):
    serializer_class = WeatherDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Retourner les données météo récentes
        return WeatherData.objects.filter(
            forecast_time__gte=timezone.now() - timezone.timedelta(hours=24)
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_weather(request):
    """
    Obtenir les conditions météo actuelles
    """
    try:
        lat = request.GET.get('lat', 14.9325)  # Cayar par défaut
        lon = request.GET.get('lon', -17.1925)
        
        # Chercher les données météo les plus récentes pour cette position
        weather = WeatherData.objects.filter(
            latitude__range=[float(lat) - 0.1, float(lat) + 0.1],
            longitude__range=[float(lon) - 0.1, float(lon) + 0.1]
        ).first()
        
        if weather:
            serializer = WeatherDataSerializer(weather)
            return Response(serializer.data)
        else:
            # Retourner des données simulées si aucune donnée en base
            return Response({
                'temperature': 26.5,
                'wind_speed': 12.3,
                'wind_direction': 245,
                'wave_height': 1.2,
                'visibility': 10.0,
                'pressure': 1013.2,
                'humidity': 75,
                'condition': 'Partiellement nuageux',
                'icon': 'partly-cloudy',
                'forecast_time': timezone.now().isoformat(),
                'latitude': lat,
                'longitude': lon
            })
            
    except Exception as e:
        return Response({
            'error': 'Erreur récupération météo',
            'details': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weather_forecast(request):
    """
    Obtenir les prévisions météo
    """
    try:
        days = int(request.GET.get('days', 3))
        
        # Simuler des prévisions pour la démonstration
        forecast = []
        for i in range(days):
            date = timezone.now() + timezone.timedelta(days=i)
            forecast.append({
                'date': date.date().isoformat(),
                'temperature': 26 + (i * 0.5),
                'wind_speed': 10 + (i * 2),
                'wave_height': 1.0 + (i * 0.2),
                'condition': 'Ensoleillé' if i == 0 else 'Partiellement nuageux'
            })
        
        return Response({'forecast': forecast})
        
    except Exception as e:
        return Response({
            'error': 'Erreur prévisions météo',
            'details': str(e)
        }, status=500)