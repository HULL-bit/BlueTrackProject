from django.contrib import admin
# from django.contrib.gis.admin import GISModelAdmin  # Temporairement désactivé

from .models import Location, Trip, TrackerDevice

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):  # Utilisation d'admin.ModelAdmin standard
    list_display = ['user', 'latitude', 'longitude', 'speed', 'timestamp']
    list_filter = ['timestamp', 'user__role']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['user', 'start_time', 'end_time', 'distance_km', 'status']
    list_filter = ['status', 'start_time', 'user__role']
    search_fields = ['user__username', 'notes']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TrackerDevice)
class TrackerDeviceAdmin(admin.ModelAdmin):
    list_display = ['device_id', 'device_type', 'user', 'is_active', 'last_communication']
    list_filter = ['device_type', 'is_active', 'last_communication']
    search_fields = ['device_id', 'imei', 'user__username']
    readonly_fields = ['created_at', 'updated_at']