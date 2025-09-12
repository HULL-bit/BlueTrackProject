#!/usr/bin/env python3
"""
Script pour tester la création d'utilisateurs avec le fix d'authentification
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

def test_user_creation_with_username():
    """Tester la création d'utilisateur avec username généré automatiquement"""
    print("=== Test de création d'utilisateur avec fix ===")
    
    # Données de test similaires à celles du frontend
    test_data = {
        'email': 'test_frontend@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123',
        'role': 'fisherman',
        'phone': '+221 77 123 4567',
        'profile': {
            'full_name': 'Test User Frontend',
            'boat_name': 'Test Boat',
            'license_number': 'TEST123'
        }
    }
    
    # Supprimer l'utilisateur s'il existe déjà
    try:
        existing_user = User.objects.get(email=test_data['email'])
        existing_user.delete()
        print(f"✅ Utilisateur existant supprimé: {test_data['email']}")
    except User.DoesNotExist:
        pass
    
    # Tester le serializer
    serializer = RegisterSerializer(data=test_data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"✅ Utilisateur créé avec succès:")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        
        # Tester l'authentification avec username
        auth_user = authenticate(username=user.username, password=test_data['password'])
        if auth_user:
            print(f"✅ Authentification avec username réussie: {auth_user.username}")
        else:
            print(f"❌ Authentification avec username échouée")
        
        # Tester l'authentification avec email
        auth_user = authenticate(username=test_data['email'], password=test_data['password'])
        if auth_user:
            print(f"✅ Authentification avec email réussie: {auth_user.username}")
        else:
            print(f"❌ Authentification avec email échouée")
            # Vérifier si l'utilisateur est actif
            print(f"   Utilisateur actif: {user.is_active}")
            print(f"   Utilisateur staff: {user.is_staff}")
            print(f"   Utilisateur superuser: {user.is_superuser}")
        
        return user
    else:
        print(f"❌ Erreur de validation: {serializer.errors}")
        return None

def test_duplicate_username_handling():
    """Tester la gestion des usernames dupliqués"""
    print("\n=== Test de gestion des usernames dupliqués ===")
    
    # Créer un premier utilisateur
    test_data1 = {
        'email': 'user1@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123',
        'role': 'fisherman',
        'phone': '+221 77 111 1111',
        'profile': {
            'full_name': 'User One',
            'boat_name': 'Boat One',
            'license_number': 'LIC001'
        }
    }
    
    # Créer un deuxième utilisateur avec le même username potentiel
    test_data2 = {
        'email': 'user1@example.org',  # Même partie avant @
        'password': 'testpass123',
        'confirm_password': 'testpass123',
        'role': 'fisherman',
        'phone': '+221 77 222 2222',
        'profile': {
            'full_name': 'User Two',
            'boat_name': 'Boat Two',
            'license_number': 'LIC002'
        }
    }
    
    # Supprimer les utilisateurs existants
    for email in [test_data1['email'], test_data2['email']]:
        try:
            existing_user = User.objects.get(email=email)
            existing_user.delete()
            print(f"✅ Utilisateur existant supprimé: {email}")
        except User.DoesNotExist:
            pass
    
    # Créer le premier utilisateur
    serializer1 = RegisterSerializer(data=test_data1)
    if serializer1.is_valid():
        user1 = serializer1.save()
        print(f"✅ Premier utilisateur créé: {user1.username}")
    else:
        print(f"❌ Erreur création premier utilisateur: {serializer1.errors}")
        return
    
    # Créer le deuxième utilisateur
    serializer2 = RegisterSerializer(data=test_data2)
    if serializer2.is_valid():
        user2 = serializer2.save()
        print(f"✅ Deuxième utilisateur créé: {user2.username}")
        
        # Vérifier que les usernames sont différents
        if user1.username != user2.username:
            print(f"✅ Usernames différents: {user1.username} vs {user2.username}")
        else:
            print(f"❌ Usernames identiques: {user1.username}")
    else:
        print(f"❌ Erreur création deuxième utilisateur: {serializer2.errors}")

if __name__ == '__main__':
    test_user_creation_with_username()
    test_duplicate_username_handling()
    print("\n=== Tests terminés ===")
