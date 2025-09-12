from rest_framework import serializers
from .models import Alert
from apps.tracking.serializers import LocationSerializer

class AlertSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.profile.full_name', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.profile.full_name', read_only=True)
    location = LocationSerializer(read_only=True)
    
    class Meta:
        model = Alert
        fields = ['id', 'user', 'user_name', 'alert_type', 'title', 'message', 
                 'severity', 'status', 'location', 'metadata', 'acknowledged_by', 
                 'acknowledged_by_name', 'acknowledged_at', 'resolved_at', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_name', 
                           'acknowledged_by_name', 'location']