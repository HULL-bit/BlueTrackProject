#!/usr/bin/env python3
"""
Script pour créer un utilisateur de test et tester la connexion
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/ProjetOuagadou-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.users.models import User, UserProfile
from django.contrib.auth import authenticate

def create_test_user():
    """Créer un utilisateur de test"""
    username = "test_user_fix"
    email = "test_fix@example.com"
    password = "testpass123"
    
    # Supprimer l'utilisateur s'il existe déjà
    try:
        existing_user = User.objects.get(username=username)
        existing_user.delete()
        print(f"✅ Utilisateur existant supprimé: {username}")
    except User.DoesNotExist:
        pass
    
    try:
        existing_user = User.objects.get(email=email)
        existing_user.delete()
        print(f"✅ Utilisateur existant supprimé: {email}")
    except User.DoesNotExist:
        pass
    
    # Créer un nouvel utilisateur
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='fisherman',
        phone='1234567890'
    )
    
    # Créer le profil
    UserProfile.objects.create(
        user=user,
        full_name="Test User Fix",
        boat_name="Test Boat",
        license_number="TEST123"
    )
    
    print(f"✅ Utilisateur créé avec succès:")
    print(f"   Username: {username}")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    
    # Tester l'authentification
    print(f"\n🔍 Test d'authentification:")
    
    # Test avec username
    auth_user = authenticate(username=username, password=password)
    if auth_user:
        print(f"✅ Authentification avec username réussie: {auth_user.username}")
    else:
        print(f"❌ Authentification avec username échouée")
    
    # Test avec email
    auth_user = authenticate(username=email, password=password)
    if auth_user:
        print(f"✅ Authentification avec email réussie: {auth_user.username}")
    else:
        print(f"❌ Authentification avec email échouée")
    
    return user

if __name__ == "__main__":
    create_test_user()
