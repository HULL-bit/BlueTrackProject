from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Alert
from .serializers import AlertSerializer
from apps.tracking.models import Location

class AlertListCreateView(generics.ListCreateAPIView):
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Alert.objects.all()
        return Alert.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Créer la location si fournie
        location_data = self.request.data.get('location')
        location = None
        
        if location_data:
            location = Location.objects.create(
                user=self.request.user,
                latitude=location_data['latitude'],
                longitude=location_data['longitude'],
                speed=location_data.get('speed', 0),
                heading=location_data.get('heading', 0),
                timestamp=timezone.now()
            )
        
        serializer.save(user=self.request.user, location=location)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def acknowledge_alert(request, alert_id):
    """
    Acquitter une alerte
    """
    try:
        alert = Alert.objects.get(id=alert_id)
        
        # Vérifier les permissions
        if request.user.role not in ['admin', 'organization'] and alert.user != request.user:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        
        alert.status = 'acknowledged'
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
        
    except Alert.DoesNotExist:
        return Response({'error': 'Alerte non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Erreur serveur',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)