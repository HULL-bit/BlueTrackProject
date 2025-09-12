from rest_framework import serializers
from .models import Location, TrackerDevice, Balise, Trip


class LocationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les localisations GPS"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'user', 'user_name', 'latitude', 'longitude', 
            'speed', 'heading', 'altitude', 'accuracy', 'timestamp'
        ]
        read_only_fields = ['id']


class TripSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les voyages"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    start_location_data = serializers.SerializerMethodField()
    end_location_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'user', 'user_name', 'start_time', 'end_time',
            'start_location', 'end_location', 'start_location_data', 'end_location_data',
            'distance_km', 'max_speed', 'avg_speed', 'fuel_consumed',
            'catch_weight', 'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_start_location_data(self, obj):
        """Récupérer les données de la localisation de départ"""
        if obj.start_location:
            return LocationSerializer(obj.start_location).data
        return None
    
    def get_end_location_data(self, obj):
        """Récupérer les données de la localisation d'arrivée"""
        if obj.end_location:
            return LocationSerializer(obj.end_location).data
        return None


class TrackerDeviceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les dispositifs de tracking"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    last_location = serializers.SerializerMethodField()
    
    class Meta:
        model = TrackerDevice
        fields = [
            'id', 'user', 'user_name', 'device_id', 'device_type', 
            'is_active', 'last_location', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_last_location(self, obj):
        """Récupérer la dernière localisation du dispositif"""
        last_location = Location.objects.filter(user=obj.user).order_by('-timestamp').first()
        if last_location:
            return LocationSerializer(last_location).data
        return None


class BaliseSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les balises GPS/VMS/AIS"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = Balise
        fields = [
            'id', 'name', 'balise_type', 'status', 'latitude', 'longitude',
            'coordinates', 'vessel_name', 'frequency', 'power',
            'battery_level', 'signal_strength', 'last_update', 'notes',
            'is_active', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'last_update', 'created_by', 'created_at', 'updated_at'
        ]
    
    def get_coordinates(self, obj):
        """Retourne les coordonnées sous forme de tuple"""
        return [float(obj.latitude), float(obj.longitude)]
    
    def create(self, validated_data):
        """Créer une nouvelle balise"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BaliseListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les listes de balises"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = Balise
        fields = [
            'id', 'name', 'balise_type', 'status', 'coordinates',
            'vessel_name', 'battery_level', 'signal_strength',
            'is_active', 'created_by_name', 'last_update'
        ]
    
    def get_coordinates(self, obj):
        """Retourne les coordonnées sous forme de tuple"""
        return [float(obj.latitude), float(obj.longitude)]


class BaliseCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création de balises"""
    
    class Meta:
        model = Balise
        fields = [
            'id', 'name', 'balise_type', 'latitude', 'longitude',
            'vessel_name', 'frequency', 'power', 'notes', 'status',
            'is_active', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'is_active', 'created_by', 'created_at']
    
    def create(self, validated_data):
        """Créer une nouvelle balise avec l'utilisateur connecté"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)