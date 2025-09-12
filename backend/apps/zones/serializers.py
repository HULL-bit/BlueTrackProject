from rest_framework import serializers
from .models import Zone


class ZoneSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour les zones"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    center_coordinates = serializers.ReadOnlyField()
    radius_coordinates = serializers.ReadOnlyField()
    is_valid_now = serializers.ReadOnlyField()
    
    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'description', 'zone_type', 'zone_shape',
            'center_latitude', 'center_longitude', 'center_coordinates',
            'radius_latitude', 'radius_longitude', 'radius_coordinates',
            'coordinates', 'radius', 'width', 'height', 'area',
            'is_active', 'is_restricted', 'max_speed',
            'valid_from', 'valid_until', 'is_valid_now',
            'color', 'opacity', 'stroke_color', 'stroke_width',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'center_coordinates', 'is_valid_now', 'created_by', 
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Créer une nouvelle zone sans utilisateur (pas d'authentification)"""
        # Pas d'utilisateur requis - created_by sera null
        return super().create(validated_data)


class ZoneListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les listes de zones"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    center_coordinates = serializers.ReadOnlyField()
    radius_coordinates = serializers.ReadOnlyField()
    is_valid_now = serializers.ReadOnlyField()
    
    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'zone_type', 'zone_shape', 'center_coordinates', 'radius_coordinates',
            'radius', 'area', 'is_active', 'is_restricted', 'is_valid_now',
            'color', 'opacity', 'created_by_name', 'created_at'
        ]


class ZoneCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création de zones"""
    
    def validate_radius(self, value):
        """Validation personnalisée pour le rayon"""
        print(f"🔵 ZoneCreateSerializer - validate_radius appelé avec: {value} (type: {type(value)})")
        
        if value is None:
            return value
            
        # Si c'est un tableau, prendre le premier élément
        if isinstance(value, (list, tuple)):
            print(f"❌ ZoneCreateSerializer - Rayon reçu comme tableau: {value}")
            if len(value) > 0:
                value = value[0]
            else:
                return None
        
        # Convertir en float
        try:
            return float(value)
        except (ValueError, TypeError):
            print(f"❌ ZoneCreateSerializer - Impossible de convertir le rayon: {value}")
            raise serializers.ValidationError("Le rayon doit être un nombre valide")
    
    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'description', 'zone_type', 'zone_shape',
            'center_latitude', 'center_longitude', 'radius_latitude', 'radius_longitude',
            'coordinates', 'radius', 'width', 'height', 'area',
            'is_active', 'is_restricted', 'max_speed',
            'valid_from', 'valid_until',
            'color', 'opacity', 'stroke_color', 'stroke_width'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        print(f"🔵 ZoneCreateSerializer - validate() appelé")
        print(f"🔵 ZoneCreateSerializer - Données de validation: {data}")
        print(f"🔵 ZoneCreateSerializer - Type du rayon dans validate: {type(data.get('radius'))}")
        print(f"🔵 ZoneCreateSerializer - Valeur du rayon dans validate: {data.get('radius')}")
        return super().validate(data)
    
    def create(self, validated_data):
        """Créer une nouvelle zone sans utilisateur (pas d'authentification)"""
        # Pas d'utilisateur requis - created_by sera null
        
        print(f"🔵 ZoneCreateSerializer - Données reçues: {validated_data}")
        print(f"🔵 ZoneCreateSerializer - Type du rayon: {type(validated_data.get('radius'))}")
        print(f"🔵 ZoneCreateSerializer - Valeur du rayon: {validated_data.get('radius')}")
        
        # S'assurer que le rayon est un nombre
        if validated_data.get('radius') is not None:
            if isinstance(validated_data['radius'], (list, tuple)):
                print(f"❌ ZoneCreateSerializer - Rayon est un tableau: {validated_data['radius']}")
                validated_data['radius'] = float(validated_data['radius'][0]) if len(validated_data['radius']) > 0 else None
                print(f"✅ ZoneCreateSerializer - Rayon corrigé: {validated_data['radius']}")
            elif not isinstance(validated_data['radius'], (int, float)):
                print(f"❌ ZoneCreateSerializer - Rayon n'est pas un nombre: {validated_data['radius']}")
                try:
                    validated_data['radius'] = float(validated_data['radius'])
                    print(f"✅ ZoneCreateSerializer - Rayon converti: {validated_data['radius']}")
                except (ValueError, TypeError):
                    print(f"❌ ZoneCreateSerializer - Impossible de convertir le rayon: {validated_data['radius']}")
                    validated_data['radius'] = None
        
        # Calculer automatiquement le rayon SEULEMENT si le rayon n'est pas déjà fourni
        if (not validated_data.get('radius') and 
            validated_data.get('center_latitude') and validated_data.get('center_longitude') and
            validated_data.get('radius_latitude') and validated_data.get('radius_longitude')):
            # Créer une instance temporaire pour calculer le rayon
            temp_zone = self.Meta.model(
                center_latitude=validated_data['center_latitude'],
                center_longitude=validated_data['center_longitude'],
                radius_latitude=validated_data['radius_latitude'],
                radius_longitude=validated_data['radius_longitude']
            )
            calculated_radius = temp_zone.calculate_radius_from_coordinates()
            if calculated_radius:
                validated_data['radius'] = calculated_radius
        
        print(f"🔵 ZoneCreateSerializer - Données finales: {validated_data}")
        return super().create(validated_data)


class ZoneGeoJSONSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'export GeoJSON des zones"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'zone_type', 'zone_shape', 'is_active', 
            'is_restricted', 'max_speed', 'color', 'opacity', 
            'stroke_color', 'stroke_width', 'valid_from', 'valid_until',
            'created_by_name', 'created_at'
        ]