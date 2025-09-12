#!/usr/bin/env python3
"""
Script pour créer des dispositifs de tracking GPS associés aux utilisateurs
"""
import os
import sys
import django
from datetime import datetime

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/ProjetOuagadou-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.users.models import User
from apps.tracking.models import TrackerDevice

def create_tracker_device(user, device_data):
    """
    Créer un dispositif de tracking pour un utilisateur
    """
    try:
        # Vérifier si le dispositif existe déjà
        if TrackerDevice.objects.filter(device_id=device_data['device_id']).exists():
            print(f"⚠️ Dispositif {device_data['device_id']} existe déjà")
            device = TrackerDevice.objects.get(device_id=device_data['device_id'])
            # Mettre à jour les informations
            device.user = user
            device.device_type = device_data['device_type']
            device.imei = device_data.get('imei', '')
            device.phone_number = device_data.get('phone_number', '')
            device.is_active = device_data.get('is_active', True)
            device.battery_level = device_data.get('battery_level', 100)
            device.signal_strength = device_data.get('signal_strength', 5)
            device.save()
            print(f"✅ Dispositif mis à jour: {device_data['device_id']}")
        else:
            # Créer un nouveau dispositif
            device = TrackerDevice.objects.create(
                device_id=device_data['device_id'],
                device_type=device_data['device_type'],
                user=user,
                imei=device_data.get('imei', ''),
                phone_number=device_data.get('phone_number', ''),
                is_active=device_data.get('is_active', True),
                battery_level=device_data.get('battery_level', 100),
                signal_strength=device_data.get('signal_strength', 5)
            )
            print(f"✅ Dispositif créé: {device_data['device_id']} pour {user.username}")
        
        return device
        
    except Exception as e:
        print(f"❌ Erreur lors de la création du dispositif {device_data['device_id']}: {e}")
        return None

def create_trackers_for_fishermen():
    """Créer des trackers pour les pêcheurs"""
    print("🐟 Création des trackers pour les pêcheurs")
    print("=" * 50)
    
    # Récupérer les utilisateurs pêcheurs
    fishermen = User.objects.filter(role='fisherman')
    
    tracker_data = [
        {
            'device_id': 'TRK001',
            'device_type': 'gps_tracker',
            'imei': '123456789012345',
            'phone_number': '+221771234567',
            'battery_level': 85,
            'signal_strength': 4
        },
        {
            'device_id': 'TRK002',
            'device_type': 'gps_tracker',
            'imei': '123456789012346',
            'phone_number': '+221772345678',
            'battery_level': 92,
            'signal_strength': 5
        },
        {
            'device_id': 'TRK003',
            'device_type': 'gps_tracker',
            'imei': '123456789012347',
            'phone_number': '+221773456789',
            'battery_level': 78,
            'signal_strength': 3
        },
        {
            'device_id': 'TRK004',
            'device_type': 'gps_tracker',
            'imei': '123456789012348',
            'phone_number': '+221774567890',
            'battery_level': 95,
            'signal_strength': 5
        }
    ]
    
    created_devices = []
    for i, fisherman in enumerate(fishermen):
        if i < len(tracker_data):
            device_data = tracker_data[i]
            device = create_tracker_device(fisherman, device_data)
            if device:
                created_devices.append(device)
        print()
    
    return created_devices

def create_trackers_for_organizations():
    """Créer des trackers pour les organisations"""
    print("🏢 Création des trackers pour les organisations")
    print("=" * 50)
    
    # Récupérer les utilisateurs organisations
    organizations = User.objects.filter(role='organization')
    
    tracker_data = [
        {
            'device_id': 'ORG001',
            'device_type': 'satellite',
            'imei': '987654321098765',
            'phone_number': '+221331234567',
            'battery_level': 100,
            'signal_strength': 5
        },
        {
            'device_id': 'ORG002',
            'device_type': 'satellite',
            'imei': '987654321098766',
            'phone_number': '+221332345678',
            'battery_level': 88,
            'signal_strength': 4
        }
    ]
    
    created_devices = []
    for i, organization in enumerate(organizations):
        if i < len(tracker_data):
            device_data = tracker_data[i]
            device = create_tracker_device(organization, device_data)
            if device:
                created_devices.append(device)
        print()
    
    return created_devices

def create_test_trackers():
    """Créer des trackers de test pour les démonstrations"""
    print("🧪 Création des trackers de test")
    print("=" * 50)
    
    # Créer un utilisateur de test si nécessaire
    test_user, created = User.objects.get_or_create(
        username='test_tracker',
        defaults={
            'email': 'test@tracker.com',
            'role': 'fisherman',
            'is_active': True
        }
    )
    
    if created:
        test_user.set_password('test123')
        test_user.save()
        print(f"✅ Utilisateur de test créé: {test_user.username}")
    
    test_trackers = [
        {
            'device_id': 'TEST001',
            'device_type': 'gps_tracker',
            'imei': '111111111111111',
            'phone_number': '+221771111111',
            'battery_level': 75,
            'signal_strength': 3
        },
        {
            'device_id': 'TEST002',
            'device_type': 'gps_tracker',
            'imei': '222222222222222',
            'phone_number': '+221772222222',
            'battery_level': 60,
            'signal_strength': 2
        },
        {
            'device_id': 'TEST003',
            'device_type': 'smartphone',
            'imei': '333333333333333',
            'phone_number': '+221773333333',
            'battery_level': 45,
            'signal_strength': 4
        }
    ]
    
    created_devices = []
    for tracker_data in test_trackers:
        device = create_tracker_device(test_user, tracker_data)
        if device:
            created_devices.append(device)
        print()
    
    return created_devices

def display_trackers_summary(all_devices):
    """Afficher un résumé des trackers créés"""
    print("📋 Résumé des trackers créés")
    print("=" * 50)
    
    for device in all_devices:
        print(f"📡 {device.device_id} ({device.get_device_type_display()})")
        print(f"   👤 Utilisateur: {device.user.username} ({device.user.profile.full_name})")
        print(f"   📱 IMEI: {device.imei}")
        print(f"   📞 Téléphone: {device.phone_number}")
        print(f"   🔋 Batterie: {device.battery_level}%")
        print(f"   📶 Signal: {device.signal_strength}/5")
        print(f"   ✅ Actif: {'Oui' if device.is_active else 'Non'}")
        print()

def main():
    """Fonction principale"""
    print("📡 Création de dispositifs de tracking GPS")
    print("=" * 50)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    all_devices = []
    
    # Créer les trackers par catégorie
    fishermen_trackers = create_trackers_for_fishermen()
    org_trackers = create_trackers_for_organizations()
    test_trackers = create_test_trackers()
    
    all_devices.extend(fishermen_trackers)
    all_devices.extend(org_trackers)
    all_devices.extend(test_trackers)
    
    # Afficher le résumé
    display_trackers_summary(all_devices)
    
    print("🎉 Création des trackers terminée!")
    print(f"✅ {len(all_devices)} dispositifs créés avec succès")
    print()
    print("📝 Instructions:")
    print("1. Les trackers peuvent maintenant envoyer des données GPS")
    print("2. Utilisez les device_id pour les webhooks GPS")
    print("3. Les données apparaîtront sur la carte en temps réel")
    print("4. Testez avec le script test_gps_system.py")

if __name__ == '__main__':
    main()
