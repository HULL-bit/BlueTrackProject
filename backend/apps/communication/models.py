from django.db import models
from django.conf import settings

class Zone(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    zone_type = models.CharField(max_length=50)
    coordinates = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='communication_zones'  # unique
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Alert(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='communication_alerts'  # unique
    )
    type = models.CharField(max_length=50)
    message = models.TextField()
    severity = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    location = models.JSONField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='communication_sent_messages',  # unique
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='communication_received_messages',  # unique
        on_delete=models.CASCADE
    )
    channel_id = models.CharField(max_length=255, default='general')
    content = models.TextField()
    message_type = models.CharField(max_length=50)
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(blank=True, null=True)

class Location(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='communication_locations'  # unique
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    speed = models.FloatField(default=0)
    heading = models.FloatField(default=0)

class Trip(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='communication_trips'  # unique
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    start_location = models.ForeignKey(
        Location,
        related_name='communication_trip_start',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    distance_km = models.FloatField(default=0)
    max_speed = models.FloatField(default=0)
    avg_speed = models.FloatField(default=0)

class Channel(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
