#!/usr/bin/env python3
"""
Script pour créer des données de test pour la plateforme Wagadou
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from apps.users.models import User as CustomUser, UserProfile
from apps.tracking.models import TrackerDevice, Location

def create_test_users():
    """Créer des utilisateurs de test avec tokens"""
    print("=== Création des utilisateurs de test ===")
    
    # Supprimer seulement les tokens existants
    Token.objects.all().delete()
    
    test_users = [
        {
            'username': 'admin',
            'email': 'admin@wagadou.sn',
            'password': 'admin123',
            'role': 'admin',
            'full_name': 'Administrateur Système',
            'phone': '+221 77 123 4567',
            'boat_name': None,
            'license_number': None
        },
        {
            'username': 'fisherman1',
            'email': 'fisherman1@test.com',
            'password': 'fisher123',
            'role': 'fisherman',
            'full_name': 'Moussa Diop',
            'phone': '+221 77 234 5678',
            'boat_name': 'Pirogue de la Paix',
            'license_number': 'LIC-001-2024'
        },
        {
            'username': 'fisherman2',
            'email': 'fisherman2@test.com',
            'password': 'fisher123',
            'role': 'fisherman',
            'full_name': 'Awa Ndiaye',
            'phone': '+221 77 345 6789',
            'boat_name': 'Espoir des Mers',
            'license_number': 'LIC-002-2024'
        },
        {
            'username': 'organization1',
            'email': 'org1@test.com',
            'password': 'org123',
            'role': 'organization',
            'full_name': 'GIE Femmes Pêcheuses',
            'phone': '+221 77 456 7890',
            'boat_name': None,
            'license_number': None
        }
    ]
    
    created_users = []
    for user_data in test_users:
        # Vérifier si l'utilisateur existe déjà
        user, created = CustomUser.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'role': user_data['role'],
                'is_active': True
            }
        )
        
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"✅ Utilisateur créé: {user.username}")
        else:
            print(f"ℹ️ Utilisateur existant: {user.username}")
        
        # Créer ou mettre à jour le profil
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': user_data['full_name'],
                'boat_name': user_data['boat_name'],
                'license_number': user_data['license_number']
            }
        )
        
        if not profile_created:
            profile.full_name = user_data['full_name']
            profile.boat_name = user_data['boat_name']
            profile.license_number = user_data['license_number']
            profile.save()
        
        # Créer le token d'authentification
        token, created = Token.objects.get_or_create(user=user)
        
        created_users.append({
            'user': user,
            'token': token.key,
            'profile': profile
        })
        
        print(f"🔑 Token: {token.key}")
    
    return created_users

def create_test_devices(users):
    """Créer des dispositifs GPS de test"""
    print("\n=== Création des dispositifs GPS de test ===")
    
    devices = [
        {
            'device_id': '000019246001',
            'device_type': 'gps_tracker',
            'user': users[1]['user'],  # fisherman1
            'imei': '123456789012345',
            'phone_number': '+221 77 234 5678',
            'is_active': True,
            'battery_level': 85,
            'signal_strength': 4
        },
        {
            'device_id': '000019246002',
            'device_type': 'gps_tracker',
            'user': users[2]['user'],  # fisherman2
            'imei': '123456789012346',
            'phone_number': '+221 77 345 6789',
            'is_active': True,
            'battery_level': 92,
            'signal_strength': 5
        }
    ]
    
    created_devices = []
    for device_data in devices:
        device, created = TrackerDevice.objects.get_or_create(
            device_id=device_data['device_id'],
            defaults=device_data
        )
        
        if created:
            print(f"✅ Dispositif créé: {device.device_id}")
        else:
            print(f"ℹ️ Dispositif existant: {device.device_id}")
        
        created_devices.append(device)
    
    return created_devices

def create_test_locations(devices):
    """Créer des localisations GPS de test"""
    print("\n=== Création des localisations GPS de test ===")
    
    # Coordonnées autour de Dakar
    base_coords = [
        (14.741551, -17.421184),  # Dakar
        (14.897359, -17.292868),  # Saint-Louis
        (14.729613, -17.478385),  # Rufisque
        (14.901550, -17.210240),  # Thiès
    ]
    
    locations = []
    for device in devices:
        base_lat, base_lon = random.choice(base_coords)
        
        # Créer plusieurs points de localisation pour simuler un trajet
        for i in range(5):
            # Ajouter une variation aléatoire
            lat = base_lat + random.uniform(-0.01, 0.01)
            lon = base_lon + random.uniform(-0.01, 0.01)
            
            location = Location.objects.create(
                user=device.user,
                latitude=lat,
                longitude=lon,
                timestamp=datetime.now() - timedelta(hours=i),
                speed=random.uniform(5, 20),
                heading=random.uniform(0, 360),
                altitude=0,
                accuracy=random.uniform(5, 15)
            )
            locations.append(location)
    
    print(f"✅ {len(locations)} localisations créées")
    return locations

def main():
    """Fonction principale"""
    print("🚢 Création des données de test pour la plateforme Wagadou")
    print("=" * 60)
    
    try:
        # Créer les utilisateurs
        users = create_test_users()
        
        # Créer les dispositifs GPS
        devices = create_test_devices(users)
        
        # Créer les localisations
        locations = create_test_locations(devices)
        
        print("\n" + "=" * 60)
        print("✅ Données de test créées avec succès!")
        print("\n📋 Informations de connexion:")
        print("- Admin: admin / admin123")
        print("- Pêcheur 1: fisherman1 / fisher123")
        print("- Pêcheur 2: fisherman2 / fisher123")
        print("- Organisation: organization1 / org123")
        print("\n🔑 Tokens d'authentification:")
        for user_data in users:
            print(f"- {user_data['user'].username}: {user_data['token']}")
        
        print("\n🌊 La plateforme est prête pour les tests!")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
