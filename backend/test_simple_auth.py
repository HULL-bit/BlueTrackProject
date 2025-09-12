#!/usr/bin/env python3
"""
Script simple pour tester l'authentification
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/ProjetOuagadou-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.users.models import User, UserProfile
from apps.users.serializers import RegisterSerializer
from django.contrib.auth import authenticate

def test_simple_auth():
    """Test simple d'authentification"""
    print("=== Test simple d'authentification ===")
    
    # Vérifier les utilisateurs existants
    users = User.objects.all()
    print(f"Nombre d'utilisateurs dans la base: {users.count()}")
    
    for user in users[:3]:  # Afficher les 3 premiers
        print(f"  - {user.username} ({user.email}) - Actif: {user.is_active}")
        
        # Tester l'authentification avec username
        auth_user = authenticate(username=user.username, password='admin123')  # Mot de passe par défaut
        if auth_user:
            print(f"    ✅ Auth avec username OK")
        else:
            print(f"    ❌ Auth avec username échouée")
        
        # Tester l'authentification avec email
        auth_user = authenticate(username=user.email, password='admin123')
        if auth_user:
            print(f"    ✅ Auth avec email OK")
        else:
            print(f"    ❌ Auth avec email échouée")

def test_user_creation():
    """Test de création d'utilisateur sans suppression"""
    print("\n=== Test de création d'utilisateur ===")
    
    # Données de test
    test_data = {
        'email': 'newuser@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123',
        'role': 'fisherman',
        'phone': '+221 77 999 9999',
        'profile': {
            'full_name': 'New Test User',
            'boat_name': 'New Test Boat',
            'license_number': 'NEW123'
        }
    }
    
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(email=test_data['email']).exists():
        print(f"✅ Utilisateur existe déjà: {test_data['email']}")
        user = User.objects.get(email=test_data['email'])
    else:
        # Créer l'utilisateur
        serializer = RegisterSerializer(data=test_data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"✅ Utilisateur créé: {user.username} ({user.email})")
        else:
            print(f"❌ Erreur création: {serializer.errors}")
            return
    
    # Tester l'authentification
    print(f"Test d'authentification pour {user.username}:")
    
    # Avec username
    auth_user = authenticate(username=user.username, password=test_data['password'])
    if auth_user:
        print(f"  ✅ Auth avec username OK")
    else:
        print(f"  ❌ Auth avec username échouée")
    
    # Avec email
    auth_user = authenticate(username=user.email, password=test_data['password'])
    if auth_user:
        print(f"  ✅ Auth avec email OK")
    else:
        print(f"  ❌ Auth avec email échouée")

if __name__ == '__main__':
    test_simple_auth()
    test_user_creation()
    print("\n=== Tests terminés ===")
