from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Zone
from .serializers import (
    ZoneSerializer, ZoneListSerializer, ZoneCreateSerializer, ZoneGeoJSONSerializer
)


class ZoneListCreateView(generics.ListCreateAPIView):
    permission_classes = []  # Pas de vérification d'authentification
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ZoneListSerializer
        return ZoneCreateSerializer
    
    def create(self, request, *args, **kwargs):
        print(f"🔵 ZoneListCreateView - create appelé")
        print(f"🔵 ZoneListCreateView - Méthode: {request.method}")
        print(f"🔵 ZoneListCreateView - Données brutes: {request.data}")
        print(f"🔵 ZoneListCreateView - Type du rayon: {type(request.data.get('radius'))}")
        print(f"🔵 ZoneListCreateView - Valeur du rayon: {request.data.get('radius')}")
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        """Filtrer les zones selon les permissions et paramètres"""
        queryset = Zone.objects.filter(is_active=True)
        
        # Filtres optionnels
        zone_type = self.request.query_params.get('type')
        if zone_type:
            queryset = queryset.filter(zone_type=zone_type)
        
        zone_shape = self.request.query_params.get('shape')
        if zone_shape:
            queryset = queryset.filter(zone_shape=zone_shape)
        
        is_restricted = self.request.query_params.get('restricted')
        if is_restricted is not None:
            queryset = queryset.filter(is_restricted=is_restricted.lower() == 'true')
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('created_by').order_by('-created_at')
    
    def perform_create(self, serializer):
        print(f"🔵 ZoneListCreateView - perform_create appelé")
        print(f"🔵 ZoneListCreateView - Données du serializer: {serializer.validated_data}")
        # Pas de vérification d'authentification - créer la zone sans utilisateur
        serializer.save()


class ZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = []  # Pas de vérification d'authentification
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ZoneCreateSerializer
        return ZoneSerializer
    
    def get_queryset(self):
        return Zone.objects.all()  # Pas de filtrage par utilisateur


@api_view(['GET'])
@permission_classes([])  # Pas de vérification d'authentification
def zones_geojson(request):
    """Retourne toutes les zones au format GeoJSON pour l'affichage sur carte"""
    try:
        zones = Zone.objects.filter(is_active=True).select_related('created_by')
        
        # Filtres optionnels
        zone_type = request.query_params.get('type')
        if zone_type:
            zones = zones.filter(zone_type=zone_type)
        
        zone_shape = request.query_params.get('shape')
        if zone_shape:
            zones = zones.filter(zone_shape=zone_shape)
        
        is_restricted = request.query_params.get('restricted')
        if is_restricted is not None:
            zones = zones.filter(is_restricted=is_restricted.lower() == 'true')
        
        # Créer la FeatureCollection GeoJSON
        features = []
        for zone in zones:
            feature = zone.get_geojson_feature()
            # Ajouter des propriétés supplémentaires
            feature['properties'].update({
                'created_by': zone.created_by.username,
                'created_at': zone.created_at.isoformat(),
                'updated_at': zone.updated_at.isoformat(),
            })
            features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        return Response(geojson)
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des zones: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([])  # Pas de vérification d'authentification
def zones_stats(request):
    """Obtenir les statistiques des zones"""
    try:
        # Statistiques globales
        total_zones = Zone.objects.count()
        active_zones = Zone.objects.filter(is_active=True).count()
        
        # Statistiques par type
        type_stats = {}
        for zone_type, _ in Zone.ZONE_TYPES:
            count = Zone.objects.filter(zone_type=zone_type, is_active=True).count()
            type_stats[zone_type] = count
        
        # Statistiques par forme
        shape_stats = {}
        for zone_shape, _ in Zone.ZONE_SHAPES:
            count = Zone.objects.filter(zone_shape=zone_shape, is_active=True).count()
            shape_stats[zone_shape] = count
        
        # Statistiques de l'utilisateur
        user_zones = Zone.objects.filter(created_by=request.user).count()
        user_active_zones = Zone.objects.filter(created_by=request.user, is_active=True).count()
        
        return Response({
            'global': {
                'total_zones': total_zones,
                'active_zones': active_zones,
                'inactive_zones': total_zones - active_zones
            },
            'by_type': type_stats,
            'by_shape': shape_stats,
            'user': {
                'total_zones': user_zones,
                'active_zones': user_active_zones
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du calcul des statistiques: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )