from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from apps.users.permissions import IsAdminOrOrganization, IsOwnerOrAdmin
from .models import Location, Trip, TrackerDevice, Balise
from .serializers import (
    LocationSerializer, TrackerDeviceSerializer, TripSerializer,
    BaliseSerializer, BaliseListSerializer, BaliseCreateSerializer
)

class LocationListCreateView(generics.ListCreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrOrganization]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Location.objects.all()
        return Location.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, timestamp=timezone.now())

@api_view(['POST'])
@permission_classes([AllowAny])  # Pour permettre aux traqueurs d'envoyer des données
def tracker_webhook(request):
    """
    Endpoint pour recevoir les données des traqueurs GPS
    Supporte plusieurs formats de données GPS
    """
    try:
        data = request.data
        print(f"📡 Données GPS reçues: {data}")
        
        # Support de différents formats de device_id
        device_id = data.get('device_id') or data.get('imei') or data.get('id')
        
        if not device_id:
            return Response({'error': 'device_id, imei ou id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Trouver le dispositif
        try:
            device = TrackerDevice.objects.get(device_id=device_id, is_active=True)
        except TrackerDevice.DoesNotExist:
            # Essayer de créer un dispositif automatiquement si l'IMEI existe
            imei = data.get('imei')
            if imei:
                try:
                    # Créer un utilisateur temporaire pour le dispositif
                    from apps.users.models import User
                    temp_user, created = User.objects.get_or_create(
                        username=f"tracker_{device_id}",
                        defaults={
                            'email': f"tracker_{device_id}@blue-track.sn",
                            'role': 'fisherman',
                            'is_active': True
                        }
                    )
                    
                    device = TrackerDevice.objects.create(
                        device_id=device_id,
                        device_type='gps_tracker',
                        user=temp_user,
                        imei=imei,
                        is_active=True
                    )
                    print(f"✅ Dispositif créé automatiquement: {device_id}")
                except Exception as e:
                    print(f"❌ Erreur création dispositif: {e}")
                    return Response({'error': 'Dispositif non trouvé et impossible à créer'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Dispositif non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Extraire les coordonnées GPS (support de différents formats)
        latitude = data.get('latitude') or data.get('lat')
        longitude = data.get('longitude') or data.get('lon') or data.get('lng')
        
        if not latitude or not longitude:
            return Response({'error': 'Coordonnées GPS manquantes'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer la position
        location_data = {
            'user': device.user.id,
            'latitude': float(latitude),
            'longitude': float(longitude),
            'speed': data.get('speed', 0),
            'heading': data.get('heading') or data.get('direction', 0),
            'altitude': data.get('altitude', 0),
            'accuracy': data.get('accuracy', 10),
            'timestamp': timezone.now()
        }
        
        serializer = LocationSerializer(data=location_data)
        if serializer.is_valid():
            location = serializer.save()
            
            # Mettre à jour le dispositif
            device.last_communication = timezone.now()
            device.battery_level = data.get('battery_level') or data.get('battery')
            device.signal_strength = data.get('signal_strength') or data.get('signal')
            device.save()
            
            # Mettre à jour l'utilisateur
            device.user.last_location_update = timezone.now()
            device.user.is_active_session = True
            device.user.save()
            
            print(f"✅ Position enregistrée: {device_id} - {latitude}, {longitude}")
            
            # Déclencher une mise à jour WebSocket (si configuré)
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'gps_updates',
                        {
                            'type': 'gps_update',
                            'data': {
                                'device_id': device_id,
                                'user_id': device.user.id,
                                'username': device.user.username,
                                'latitude': float(latitude),
                                'longitude': float(longitude),
                                'speed': location_data['speed'],
                                'heading': location_data['heading'],
                                'timestamp': location.timestamp.isoformat(),
                                'battery_level': device.battery_level,
                                'signal_strength': device.signal_strength
                            }
                        }
                    )
            except Exception as e:
                print(f"⚠️ WebSocket non disponible: {e}")
            
            return Response({
                'status': 'success',
                'location_id': location.id,
                'device_id': device_id,
                'message': 'Position enregistrée avec succès',
                'coordinates': {
                    'latitude': float(latitude),
                    'longitude': float(longitude)
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': 'Erreur serveur',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Trip.objects.all()
        return Trip.objects.filter(user=user)

class TrackerDeviceListView(generics.ListCreateAPIView):
    serializer_class = TrackerDeviceSerializer
    permission_classes = [IsAdminOrOrganization]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return TrackerDevice.objects.all()
        return TrackerDevice.objects.filter(user=user)

class BaliseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]  # Les balises sont accessibles à tous les utilisateurs authentifiés
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BaliseListSerializer
        return BaliseCreateSerializer
    
    def get_queryset(self):
        """Filtrer les balises selon les permissions et paramètres"""
        queryset = Balise.objects.filter(is_active=True)
        
        # Filtres optionnels
        balise_type = self.request.query_params.get('type')
        if balise_type:
            queryset = queryset.filter(balise_type=balise_type)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(vessel_name__icontains=search)
            )
        
        return queryset.select_related('created_by').order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class BaliseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BaliseSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Balise.objects.all()
        return Balise.objects.filter(created_by=user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def balises_geojson(request):
    """Retourne toutes les balises au format GeoJSON pour l'affichage sur carte"""
    try:
        balises = Balise.objects.filter(is_active=True).select_related('created_by')
        
        # Filtres optionnels
        balise_type = request.query_params.get('type')
        if balise_type:
            balises = balises.filter(balise_type=balise_type)
        
        status_filter = request.query_params.get('status')
        if status_filter:
            balises = balises.filter(status=status_filter)
        
        # Créer la FeatureCollection GeoJSON
        features = []
        for balise in balises:
            feature = {
                "type": "Feature",
                "properties": {
                    "id": balise.id,
                    "name": balise.name,
                    "balise_type": balise.balise_type,
                    "balise_type_display": balise.get_balise_type_display(),
                    "status": balise.status,
                    "status_display": balise.get_status_display(),
                    "vessel_name": balise.vessel_name,
                    "battery_level": balise.battery_level,
                    "signal_strength": balise.signal_strength,
                    "frequency": balise.frequency,
                    "power": balise.power,
                    "notes": balise.notes,
                    "created_by": balise.created_by.username,
                    "last_update": balise.last_update.isoformat() if balise.last_update else None,
                    "created_at": balise.created_at.isoformat(),
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(balise.longitude), float(balise.latitude)]
                }
            }
            features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        return Response(geojson)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des balises',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])  # Pour permettre l'accès public aux positions
def live_positions(request):
    """
    Endpoint pour récupérer les positions en temps réel des trackers
    """
    try:
        # Récupérer les dernières positions (dernières 24h)
        from datetime import timedelta
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        locations = Location.objects.filter(
            timestamp__gte=cutoff_time
        ).select_related('user').order_by('-timestamp')
        
        # Grouper par utilisateur pour avoir la dernière position de chacun
        latest_positions = {}
        for location in locations:
            user_id = location.user.id
            if user_id not in latest_positions:
                latest_positions[user_id] = location
        
        # Créer la réponse GeoJSON
        features = []
        for user_id, location in latest_positions.items():
            # Récupérer le dispositif associé
            try:
                device = TrackerDevice.objects.get(user=location.user, is_active=True)
            except TrackerDevice.DoesNotExist:
                device = None
            
            feature = {
                "type": "Feature",
                "properties": {
                    "user_id": location.user.id,
                    "username": location.user.username,
                    "full_name": location.user.profile.full_name if hasattr(location.user, 'profile') else location.user.username,
                    "device_id": device.device_id if device else None,
                    "device_type": device.device_type if device else None,
                    "speed": float(location.speed) if location.speed else 0,
                    "heading": location.heading if location.heading else 0,
                    "altitude": float(location.altitude) if location.altitude else 0,
                    "accuracy": float(location.accuracy) if location.accuracy else 10,
                    "battery_level": device.battery_level if device else None,
                    "signal_strength": device.signal_strength if device else None,
                    "last_communication": device.last_communication.isoformat() if device and device.last_communication else None,
                    "timestamp": location.timestamp.isoformat(),
                    "is_active": location.user.is_active_session if hasattr(location.user, 'is_active_session') else True
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(location.longitude), float(location.latitude)]
                }
            }
            features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "total_positions": len(features),
                "last_update": timezone.now().isoformat(),
                "time_range": "24h"
            }
        }
        
        return Response(geojson)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération des positions',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def device_status(request, device_id):
    """
    Endpoint pour vérifier le statut d'un dispositif
    """
    try:
        device = TrackerDevice.objects.get(device_id=device_id)
        
        # Récupérer la dernière position
        last_location = Location.objects.filter(user=device.user).order_by('-timestamp').first()
        
        status_data = {
            'device_id': device.device_id,
            'device_type': device.device_type,
            'is_active': device.is_active,
            'battery_level': device.battery_level,
            'signal_strength': device.signal_strength,
            'last_communication': device.last_communication.isoformat() if device.last_communication else None,
            'user': {
                'id': device.user.id,
                'username': device.user.username,
                'full_name': device.user.profile.full_name if hasattr(device.user, 'profile') else device.user.username
            },
            'last_position': {
                'latitude': float(last_location.latitude) if last_location else None,
                'longitude': float(last_location.longitude) if last_location else None,
                'timestamp': last_location.timestamp.isoformat() if last_location else None,
                'speed': float(last_location.speed) if last_location and last_location.speed else None
            }
        }
        
        return Response(status_data)
        
    except TrackerDevice.DoesNotExist:
        return Response({'error': 'Dispositif non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la récupération du statut',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des balises: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )