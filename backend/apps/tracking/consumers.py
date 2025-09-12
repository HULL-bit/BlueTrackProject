import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from apps.tracking.models import Location, TrackerDevice
from django.utils import timezone

class GPSUpdatesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Rejoindre le groupe des mises à jour GPS
        await self.channel_layer.group_add(
            'gps_updates',
            self.channel_name
        )
        
        await self.accept()
        
        # Envoyer les positions actuelles
        await self.send_current_positions()

    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            'gps_updates',
            self.channel_name
        )

    async def gps_update(self, event):
        # Envoyer la mise à jour GPS au client
        await self.send(text_data=json.dumps({
            'type': 'gps_update',
            'data': event['data']
        }))

    async def send_current_positions(self):
        """Envoyer les positions actuelles au client"""
        positions = await self.get_live_positions()
        await self.send(text_data=json.dumps({
            'type': 'initial_positions',
            'data': positions
        }))

    @database_sync_to_async
    def get_live_positions(self):
        """Récupérer les positions en temps réel depuis la base de données"""
        from datetime import timedelta
        
        # Récupérer les dernières positions (dernières 24h)
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
        
        # Créer la réponse
        positions = []
        for user_id, location in latest_positions.items():
            # Récupérer le dispositif associé
            try:
                device = TrackerDevice.objects.get(user=location.user, is_active=True)
            except TrackerDevice.DoesNotExist:
                device = None
            
            position_data = {
                'user_id': location.user.id,
                'username': location.user.username,
                'full_name': location.user.profile.full_name if hasattr(location.user, 'profile') else location.user.username,
                'device_id': device.device_id if device else None,
                'device_type': device.device_type if device else None,
                'latitude': float(location.latitude),
                'longitude': float(location.longitude),
                'speed': float(location.speed) if location.speed else 0,
                'heading': location.heading if location.heading else 0,
                'altitude': float(location.altitude) if location.altitude else 0,
                'accuracy': float(location.accuracy) if location.accuracy else 10,
                'battery_level': device.battery_level if device else None,
                'signal_strength': device.signal_strength if device else None,
                'last_communication': device.last_communication.isoformat() if device and device.last_communication else None,
                'timestamp': location.timestamp.isoformat(),
                'is_active': location.user.is_active_session if hasattr(location.user, 'is_active_session') else True
            }
            positions.append(position_data)
        
        return positions

