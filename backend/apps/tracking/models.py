from django.db import models
from django.utils import timezone
from apps.users.models import User

class Location(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    # Temporarily disabled PostGIS field - will re-enable when GDAL is available
    # position = models.PointField(geography=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    heading = models.IntegerField(null=True, blank=True)
    altitude = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    accuracy = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Temporarily disabled PostGIS functionality
        # if self.latitude and self.longitude:
        #     self.position = Point(float(self.longitude), float(self.latitude))
        super().save(*args, **kwargs)

class Trip(models.Model):
    STATUS_CHOICES = [
        ('active', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    start_location = models.ForeignKey(Location, on_delete=models.SET_NULL, 
                                     null=True, related_name='trips_started')
    end_location = models.ForeignKey(Location, on_delete=models.SET_NULL, 
                                   null=True, related_name='trips_ended')
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    max_speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    avg_speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fuel_consumed = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    catch_weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']

class TrackerDevice(models.Model):
    """Modèle pour les dispositifs de tracking GPS"""
    DEVICE_TYPES = [
        ('gps_tracker', 'Traqueur GPS'),
        ('smartphone', 'Smartphone'),
        ('satellite', 'Dispositif Satellite'),
    ]
    
    device_id = models.CharField(max_length=100, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    imei = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_communication = models.DateTimeField(null=True, blank=True)
    battery_level = models.IntegerField(null=True, blank=True)
    signal_strength = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.device_id} - {self.user.username}"

class Balise(models.Model):
    """Modèle pour les balises GPS/VMS/AIS"""
    BALISE_TYPES = [
        ('gps', 'Balise GPS'),
        ('vms', 'VMS (Vessel Monitoring System)'),
        ('ais', 'AIS (Automatic Identification System)'),
        ('emergency', 'Balise d\'urgence'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'En maintenance'),
        ('error', 'Erreur'),
    ]
    
    name = models.CharField(max_length=255)
    balise_type = models.CharField(max_length=20, choices=BALISE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    vessel_name = models.CharField(max_length=255, blank=True)
    frequency = models.CharField(max_length=20, blank=True)
    power = models.CharField(max_length=50, blank=True)
    battery_level = models.IntegerField(null=True, blank=True, help_text="Niveau de batterie en pourcentage")
    signal_strength = models.IntegerField(null=True, blank=True, help_text="Force du signal en pourcentage")
    last_update = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_balises')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['balise_type', 'status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_balise_type_display()}) - {self.get_status_display()}"