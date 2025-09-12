#!/usr/bin/env python
"""
Script pour créer des utilisateurs de test pour Blue-Track
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.users.models import User, UserProfile
from apps.tracking.models import TrackerDevice

def create_test_users():
    """Créer des utilisateurs de test avec différents rôles"""
    
    # Utilisateurs à créer
    test_users = [
        {
            'username': 'admin',
            'email': 'admin@bluetrack.sn',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'Blue-Track',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'username': 'fisherman1',
            'email': 'moussa.diop@example.com',
            'password': 'fisherman123',
            'first_name': 'Moussa',
            'last_name': 'Diop',
            'role': 'fisherman',
            'phone': '+221 77 123 45 67',
            'boat_name': 'Pirogue de la Paix'
        },
        {
            'username': 'fisherman2',
            'email': 'fatou.sarr@example.com',
            'password': 'fisherman123',
            'first_name': 'Fatou',
            'last_name': 'Sarr',
            'role': 'fisherman',
            'phone': '+221 78 234 56 78',
            'boat_name': 'Espoir des Mers'
        },
        {
            'username': 'organization1',
            'email': 'ong.maritime@example.com',
            'password': 'org123',
            'first_name': 'ONG',
            'last_name': 'Maritime Sénégal',
            'role': 'organization',
            'phone': '+221 33 123 45 67',
            'organization_name': 'ONG Maritime Sénégal'
        },
        {
            'username': 'organization2',
            'email': 'gie.pecheurs@example.com',
            'password': 'org123',
            'first_name': 'GIE',
            'last_name': 'Pêcheurs de Cayar',
            'role': 'organization',
            'phone': '+221 33 234 56 78',
            'organization_name': 'GIE Pêcheurs de Cayar'
        }
    ]
    
    created_users = []
    
    for user_data in test_users:
        username = user_data['username']
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=username).exists():
            print(f"✅ Utilisateur {username} existe déjà")
            user = User.objects.get(username=username)
        else:
            # Créer l'utilisateur
            user = User.objects.create_user(
                username=username,
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                phone=user_data.get('phone', ''),
                is_staff=user_data.get('is_staff', False),
                is_superuser=user_data.get('is_superuser', False)
            )
            print(f"✅ Utilisateur {username} créé")
        
        # Créer ou mettre à jour le profil
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'boat_name': user_data.get('boat_name', ''),
                'organization_name': user_data.get('organization_name', ''),
                'full_name': f"{user_data['first_name']} {user_data['last_name']}"
            }
        )
        
        if not created:
            # Mettre à jour le profil existant
            profile.boat_name = user_data.get('boat_name', '')
            profile.organization_name = user_data.get('organization_name', '')
            profile.full_name = f"{user_data['first_name']} {user_data['last_name']}"
            profile.save()
            print(f"✅ Profil de {username} mis à jour")
        else:
            print(f"✅ Profil de {username} créé")
        
        created_users.append(user)
    
    # Créer des armateurs de test (dans le profil utilisateur)
    # create_test_armateurs()
    
    # Créer des dispositifs de test
    create_test_devices()
    
    print(f"\n🎉 {len(created_users)} utilisateurs créés/mis à jour avec succès!")
    print("\n📋 Identifiants de connexion:")
    print("=" * 50)
    for user_data in test_users:
        print(f"👤 {user_data['username']} / {user_data['password']} ({user_data['role']})")
    print("=" * 50)

# def create_test_armateurs():
#     """Créer des armateurs de test"""
#     pass

def create_test_devices():
    """Créer des dispositifs de test"""
    
    test_devices = [
        {
            'device_id': '015024020236',
            'name': 'GPS Pirogue 1',
            'device_type': 'GPS',
            'status': 'active',
            'description': 'Dispositif GPS pour pirogue de pêche'
        },
        {
            'device_id': '015024020877',
            'name': 'GPS Pirogue 2',
            'device_type': 'GPS',
            'status': 'active',
            'description': 'Dispositif GPS pour pirogue de pêche'
        },
        {
            'device_id': '015024021175',
            'name': 'GPS Pirogue 3',
            'device_type': 'GPS',
            'status': 'active',
            'description': 'Dispositif GPS pour pirogue de pêche'
        }
    ]
    
    # Récupérer le premier utilisateur pêcheur pour associer les dispositifs
    fisherman_user = User.objects.filter(role='fisherman').first()
    
    for device_data in test_devices:
        if fisherman_user:
            device_data['user'] = fisherman_user
            device_data['device_type'] = 'gps_tracker'
            device_data['is_active'] = True
            
            device, created = TrackerDevice.objects.get_or_create(
                device_id=device_data['device_id'],
                defaults=device_data
            )
            
            if created:
                print(f"✅ Dispositif {device_data['device_id']} créé")
            else:
                print(f"✅ Dispositif {device_data['device_id']} existe déjà")
        else:
            print(f"⚠️ Aucun utilisateur pêcheur trouvé pour associer le dispositif {device_data['device_id']}")

if __name__ == '__main__':
    print("🚀 Création des utilisateurs de test pour Blue-Track...")
    print("=" * 60)
    
    try:
        create_test_users()
        print("\n✅ Script terminé avec succès!")
    except Exception as e:
        print(f"\n❌ Erreur lors de la création des utilisateurs: {e}")
        sys.exit(1)
