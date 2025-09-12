#!/usr/bin/env python3
"""
Script de test pour générer des données marines réalistes
pour tester l'intégration de la carte marine
"""

import os
import sys
import django
import random
import math
from datetime import datetime, timedelta
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.tracking.models import TrackerDevice, Location
from apps.users.models import User

def generate_marine_coordinates(center_lat=14.7167, center_lon=-17.4677, radius_km=50):
    """Génère des coordonnées marines réalistes autour de Dakar"""
    # Convertir le rayon en degrés (approximatif)
    radius_deg = radius_km / 111.0
    
    # Générer un point aléatoire dans le cercle
    angle = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0, radius_deg)
    
    lat = center_lat + distance * math.cos(angle)
    lon = center_lon + distance * math.sin(angle)
    
    return lat, lon

def generate_realistic_speed():
    """Génère une vitesse réaliste pour un bateau de pêche"""
    # Vitesse typique d'un bateau de pêche: 5-25 km/h
    return random.uniform(5, 25)

def generate_realistic_heading():
    """Génère un cap réaliste (0-360 degrés)"""
    return random.uniform(0, 360)

def generate_realistic_altitude():
    """Génère une altitude réaliste (niveau de la mer)"""
    # Altitude proche du niveau de la mer
    return random.uniform(-5, 10)

def create_test_devices():
    """Crée des dispositifs de test réalistes"""
    devices_data = [
        {
            'device_id': '000019246001',
            'device_type': 'gps_tracker',
            'imei': '123456789012345',
            'phone_number': '+221701234567',
            'is_active': True,
            'battery_level': 85,
            'signal_strength': 4
        },
        {
            'device_id': '000019246002',
            'device_type': 'gps_tracker',
            'imei': '123456789012346',
            'phone_number': '+221701234568',
            'is_active': True,
            'battery_level': 92,
            'signal_strength': 5
        },
        {
            'device_id': '000019246003',
            'device_type': 'gps_tracker',
            'imei': '123456789012347',
            'phone_number': '+221701234569',
            'is_active': False,
            'battery_level': 23,
            'signal_strength': 1
        },
        {
            'device_id': '000019246004',
            'device_type': 'smartphone',
            'imei': '123456789012348',
            'phone_number': '+221701234570',
            'is_active': True,
            'battery_level': 67,
            'signal_strength': 3
        },
        {
            'device_id': '000019246005',
            'device_type': 'satellite',
            'imei': '123456789012349',
            'phone_number': '+221701234571',
            'is_active': True,
            'battery_level': 78,
            'signal_strength': 4
        }
    ]
    
    # Créer ou récupérer un utilisateur de test
    user, created = User.objects.get_or_create(
        username='test_fisherman',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'Fisherman'
        }
    )
    
    devices = []
    for device_data in devices_data:
        device, created = TrackerDevice.objects.get_or_create(
            device_id=device_data['device_id'],
            defaults={
                'device_type': device_data['device_type'],
                'user': user,
                'imei': device_data['imei'],
                'phone_number': device_data['phone_number'],
                'is_active': device_data['is_active'],
                'battery_level': device_data['battery_level'],
                'signal_strength': device_data['signal_strength'],
                'last_communication': datetime.now()
            }
        )
        
        if not created:
            # Mettre à jour les données existantes
            device.is_active = device_data['is_active']
            device.battery_level = device_data['battery_level']
            device.signal_strength = device_data['signal_strength']
            device.last_communication = datetime.now()
            device.save()
        
        devices.append(device)
        print(f"Dispositif {'créé' if created else 'mis à jour'}: {device.device_id}")
    
    return devices, user

def create_test_locations(devices, user, num_locations_per_device=20):
    """Crée des localisations de test réalistes"""
    print(f"\nGénération de {num_locations_per_device} positions par dispositif...")
    
    # Supprimer les anciennes localisations de test
    Location.objects.filter(user=user).delete()
    
    for device in devices:
        if not device.is_active:
            continue
            
        # Point de départ pour ce dispositif
        start_lat, start_lon = generate_marine_coordinates()
        current_lat, current_lon = start_lat, start_lon
        
        for i in range(num_locations_per_device):
            # Simuler un mouvement réaliste
            if i > 0:
                # Déplacement aléatoire
                heading = generate_realistic_heading()
                speed_kmh = generate_realistic_speed()
                speed_ms = speed_kmh / 3.6  # Convertir en m/s
                
                # Déplacement sur 5 minutes
                time_seconds = 300
                distance_meters = speed_ms * time_seconds
                distance_deg = distance_meters / 111000  # Convertir en degrés
                
                # Calculer la nouvelle position
                lat_change = distance_deg * math.cos(math.radians(heading))
                lon_change = distance_deg * math.sin(math.radians(heading))
                
                current_lat += lat_change
                current_lon += lon_change
            
            # Créer la localisation
            location = Location.objects.create(
                user=user,
                latitude=Decimal(str(current_lat)),
                longitude=Decimal(str(current_lon)),
                speed=generate_realistic_speed(),
                heading=generate_realistic_heading(),
                altitude=generate_realistic_altitude(),
                accuracy=random.uniform(5, 15),
                timestamp=datetime.now() - timedelta(minutes=(num_locations_per_device - i) * 5)
            )
            
            print(f"Position {i+1}/{num_locations_per_device} pour {device.device_id}: "
                  f"{current_lat:.6f}, {current_lon:.6f}")
    
    print(f"\nTotal de {Location.objects.filter(user=user).count()} positions créées")

def main():
    """Fonction principale"""
    print("=== Génération de données marines de test ===")
    
    try:
        # Créer les dispositifs
        devices, user = create_test_devices()
        
        # Créer les localisations
        create_test_locations(devices, user)
        
        # Afficher les statistiques
        print("\n=== Statistiques ===")
        print(f"Utilisateur: {user.username}")
        print(f"Dispositifs créés: {len(devices)}")
        print(f"Dispositifs actifs: {len([d for d in devices if d.is_active])}")
        print(f"Positions totales: {Location.objects.filter(user=user).count()}")
        
        # Afficher les dispositifs
        print("\n=== Dispositifs ===")
        for device in devices:
            status = "🟢 Actif" if device.is_active else "🔴 Inactif"
            print(f"{device.device_id} ({device.device_type}) - {status} - "
                  f"Batterie: {device.battery_level}% - Signal: {device.signal_strength}/5")
        
        print("\n✅ Données de test générées avec succès!")
        print("Vous pouvez maintenant tester la carte marine dans l'interface web.")
        
    except Exception as e:
        print(f"❌ Erreur lors de la génération des données: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
