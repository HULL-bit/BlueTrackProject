#!/usr/bin/env python
"""
Script de test pour vérifier les corrections d'authentification
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import User, UserProfile
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
import json

User = get_user_model()

def test_user_creation():
    """Test de création d'utilisateur"""
    print("🧪 Test de création d'utilisateur...")
    
    # Données de test
    user_data = {
        'username': 'test_fisherman',
        'email': 'test@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123',
        'role': 'fisherman',
        'phone': '+221123456789',
        'profile': {
            'full_name': 'Test Fisherman',
            'boat_name': 'Test Boat',
            'license_number': 'LIC123',
            'emergency_contact': '+221987654321',
            'organization_name': '',
            'organization_type': ''
        }
    }
    
    try:
        # Créer l'utilisateur
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],
            role=user_data['role'],
            phone=user_data['phone']
        )
        
        # Créer le profil
        UserProfile.objects.create(
            user=user,
            full_name=user_data['profile']['full_name'],
            boat_name=user_data['profile']['boat_name'],
            license_number=user_data['profile']['license_number'],
            emergency_contact=user_data['profile']['emergency_contact']
        )
        
        print(f"✅ Utilisateur créé avec succès: {user.username} ({user.role})")
        return user
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return None

def test_authentication():
    """Test d'authentification"""
    print("\n🔐 Test d'authentification...")
    
    client = APIClient()
    
    # Test de connexion
    login_data = {
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    
    try:
        response = client.post('/api/auth/login/', login_data, format='json')
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connexion réussie: {data.get('message')}")
            print(f"   Token: {data.get('token', 'N/A')[:20]}...")
            return data.get('token')
        else:
            print(f"❌ Échec de connexion: {response.status_code}")
            print(f"   Erreur: {response.json()}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur lors de la connexion: {e}")
        return None

def test_permissions(token):
    """Test des permissions selon le rôle"""
    print("\n🛡️ Test des permissions...")
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    
    # Test accès GPS Tracking (devrait être refusé pour les pêcheurs)
    try:
        response = client.get('/api/tracking/locations/')
        
        if response.status_code == 403:
            print("✅ Accès GPS Tracking correctement refusé pour les pêcheurs")
        elif response.status_code == 200:
            print("⚠️ Accès GPS Tracking autorisé (peut être normal selon la configuration)")
        else:
            print(f"❌ Réponse inattendue: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur lors du test GPS: {e}")
    
    # Test accès aux médias (devrait être autorisé)
    try:
        response = client.get('/api/media/')
        
        if response.status_code == 200:
            print("✅ Accès aux médias autorisé")
        else:
            print(f"❌ Accès aux médias refusé: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur lors du test médias: {e}")

def test_admin_user():
    """Test avec un utilisateur administrateur"""
    print("\n👑 Test utilisateur administrateur...")
    
    try:
        # Créer un admin
        admin = User.objects.create_user(
            username='admin_test',
            email='admin@example.com',
            password='adminpass123',
            role='admin',
            phone='+221111111111'
        )
        
        UserProfile.objects.create(user=admin, full_name='Admin Test')
        
        # Test de connexion admin
        client = APIClient()
        login_data = {
            'email': 'admin@example.com',
            'password': 'adminpass123'
        }
        
        response = client.post('/api/auth/login/', login_data, format='json')
        
        if response.status_code == 200:
            token = response.json().get('token')
            client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
            
            # Test accès GPS Tracking (devrait être autorisé pour les admins)
            gps_response = client.get('/api/tracking/locations/')
            
            if gps_response.status_code in [200, 404]:  # 404 si pas de données
                print("✅ Accès GPS Tracking autorisé pour les administrateurs")
            else:
                print(f"❌ Accès GPS Tracking refusé pour les admins: {gps_response.status_code}")
                
        else:
            print(f"❌ Connexion admin échouée: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur lors du test admin: {e}")

def cleanup():
    """Nettoyage des données de test"""
    print("\n🧹 Nettoyage...")
    
    try:
        User.objects.filter(username__startswith='test_').delete()
        User.objects.filter(username__startswith='admin_').delete()
        print("✅ Données de test supprimées")
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {e}")

def main():
    """Fonction principale"""
    print("🚀 Test des corrections d'authentification")
    print("=" * 50)
    
    # Test 1: Création d'utilisateur
    user = test_user_creation()
    if not user:
        print("❌ Impossible de continuer sans utilisateur de test")
        return
    
    # Test 2: Authentification
    token = test_authentication()
    if not token:
        print("❌ Impossible de continuer sans token d'authentification")
        return
    
    # Test 3: Permissions
    test_permissions(token)
    
    # Test 4: Utilisateur admin
    test_admin_user()
    
    # Nettoyage
    cleanup()
    
    print("\n🎉 Tests terminés!")

if __name__ == '__main__':
    main()
