from rest_framework import serializers
from .models import Donation, DonationGoal

class DonationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les donations"""
    
    display_name = serializers.ReadOnlyField()
    display_organization = serializers.ReadOnlyField()
    
    class Meta:
        model = Donation
        fields = [
            'id', 'donor_name', 'donor_email', 'donor_phone', 'donor_organization',
            'donation_type', 'amount', 'description', 'purpose', 'status',
            'is_anonymous', 'is_public', 'created_at', 'updated_at',
            'confirmed_at', 'completed_at', 'processed_by', 'display_name',
            'display_organization'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'confirmed_at', 'completed_at', 'processed_by']
    
    def create(self, validated_data):
        """Créer une nouvelle donation"""
        # Si c'est anonyme, on ne sauvegarde pas les infos personnelles
        if validated_data.get('is_anonymous', False):
            validated_data['donor_name'] = 'Anonyme'
            validated_data['donor_email'] = 'anonyme@blue-track.com'
            validated_data['donor_phone'] = ''
            validated_data['donor_organization'] = ''
        
        return super().create(validated_data)


class DonationCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création de donations (public)"""
    
    class Meta:
        model = Donation
        fields = [
            'donor_name', 'donor_email', 'donor_phone', 'donor_organization',
            'donation_type', 'amount', 'description', 'purpose',
            'is_anonymous', 'is_public'
        ]
    
    def validate_amount(self, value):
        """Valider le montant"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Le montant ne peut pas être négatif")
        return value


class DonationGoalSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les objectifs de donation"""
    
    progress_percentage = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = DonationGoal
        fields = [
            'id', 'title', 'description', 'target_amount', 'current_amount',
            'is_active', 'deadline', 'created_at', 'updated_at',
            'progress_percentage', 'remaining_amount'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_amount']


class PublicDonationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'affichage public des donations"""
    
    display_name = serializers.ReadOnlyField()
    display_organization = serializers.ReadOnlyField()
    
    class Meta:
        model = Donation
        fields = [
            'id', 'donation_type', 'amount', 'description', 'purpose',
            'is_anonymous', 'created_at', 'display_name', 'display_organization'
        ]
    
    def to_representation(self, instance):
        """Masquer les informations sensibles pour l'affichage public"""
        data = super().to_representation(instance)
        
        # Si c'est anonyme, on ne montre pas les détails
        if instance.is_anonymous:
            data['display_name'] = "Donateur anonyme"
            data['display_organization'] = None
        
        return data

