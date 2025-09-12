#!/usr/bin/env python3
"""
Script pour créer des utilisateurs authentifiables pour Blue Track
"""
import os
import sys
import django
from datetime import datetime

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/ProjetOuagadou-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.users.models import User, UserProfile
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

def create_authenticated_user(user_data):
    """
    Créer un utilisateur avec authentification
    """
    try:
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(email=user_data['email']).exists():
            print(f"⚠️ Utilisateur {user_data['email']} existe déjà")
            user = User.objects.get(email=user_data['email'])
            # Mettre à jour le mot de passe
            user.set_password(user_data['password'])
            user.save()
            print(f"✅ Mot de passe mis à jour pour {user_data['email']}")
        else:
            # Créer un nouvel utilisateur
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                role=user_data['role'],
                phone=user_data.get('phone', ''),
                is_active=True
            )
            print(f"✅ Utilisateur créé: {user_data['username']} ({user_data['email']})")
        
        # Créer ou mettre à jour le profil
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': user_data['full_name'],
                'boat_name': user_data.get('boat_name', ''),
                'license_number': user_data.get('license_number', ''),
                'emergency_contact': user_data.get('emergency_contact', ''),
                'organization_name': user_data.get('organization_name', ''),
                'organization_type': user_data.get('organization_type', '')
            }
        )
        
        if not created:
            # Mettre à jour le profil existant
            profile.full_name = user_data['full_name']
            profile.boat_name = user_data.get('boat_name', '')
            profile.license_number = user_data.get('license_number', '')
            profile.emergency_contact = user_data.get('emergency_contact', '')
            profile.organization_name = user_data.get('organization_name', '')
            profile.organization_type = user_data.get('organization_type', '')
            profile.save()
            print(f"✅ Profil mis à jour pour {user_data['username']}")
        else:
            print(f"✅ Profil créé pour {user_data['username']}")
        
        # Créer un token d'authentification
        token, created = Token.objects.get_or_create(user=user)
        if created:
            print(f"🔑 Token créé: {token.key}")
        else:
            print(f"🔑 Token existant: {token.key}")
        
        # Tester l'authentification
        auth_user = authenticate(username=user_data['username'], password=user_data['password'])
        if auth_user:
            print(f"✅ Authentification réussie pour {user_data['username']}")
        else:
            print(f"❌ Erreur d'authentification pour {user_data['username']}")
        
        return user, token
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de {user_data['username']}: {e}")
        return None, None

def create_fisherman_users():
    """Créer des utilisateurs pêcheurs"""
    print("🐟 Création des utilisateurs pêcheurs")
    print("=" * 50)
    
    fishermen_data = [
        {
            'username': 'moussa_diop',
            'email': 'moussa.diop@example.com',
            'password': 'moussa123',
            'role': 'fisherman',
            'phone': '+221 77 123 4567',
            'full_name': 'Moussa Diop',
            'boat_name': 'Pirogue de la Paix',
            'license_number': 'LIC-001-2024',
            'emergency_contact': '+221 77 123 4568'
        },
        {
            'username': 'awa_ndiaye',
            'email': 'awa.ndiaye@example.com',
            'password': 'awa123',
            'role': 'fisherman',
            'phone': '+221 77 234 5678',
            'full_name': 'Awa Ndiaye',
            'boat_name': 'Espoir des Mers',
            'license_number': 'LIC-002-2024',
            'emergency_contact': '+221 77 234 5679'
        },
        {
            'username': 'ibrahima_sarr',
            'email': 'ibrahima.sarr@example.com',
            'password': 'ibrahima123',
            'role': 'fisherman',
            'phone': '+221 77 345 6789',
            'full_name': 'Ibrahima Sarr',
            'boat_name': 'Courage du Pêcheur',
            'license_number': 'LIC-003-2024',
            'emergency_contact': '+221 77 345 6790'
        },
        {
            'username': 'fatou_fall',
            'email': 'fatou.fall@example.com',
            'password': 'fatou123',
            'role': 'fisherman',
            'phone': '+221 77 456 7890',
            'full_name': 'Fatou Fall',
            'boat_name': 'Étoile de Mer',
            'license_number': 'LIC-004-2024',
            'emergency_contact': '+221 77 456 7891'
        }
    ]
    
    created_users = []
    for fisherman_data in fishermen_data:
        user, token = create_authenticated_user(fisherman_data)
        if user:
            created_users.append({
                'user': user,
                'token': token,
                'credentials': {
                    'username': fisherman_data['username'],
                    'email': fisherman_data['email'],
                    'password': fisherman_data['password']
                }
            })
        print()
    
    return created_users

def create_organization_users():
    """Créer des utilisateurs organisations"""
    print("🏢 Création des utilisateurs organisations")
    print("=" * 50)
    
    organizations_data = [
        {
            'username': 'gie_pecheurs_cayar',
            'email': 'contact@gie-cayar.sn',
            'password': 'gie123',
            'role': 'organization',
            'phone': '+221 33 123 4567',
            'full_name': 'GIE Pêcheurs de Cayar',
            'organization_name': 'GIE Pêcheurs de Cayar',
            'organization_type': 'fishing_cooperative',
            'emergency_contact': '+221 33 123 4568'
        },
        {
            'username': 'ong_maritime_senegal',
            'email': 'info@ong-maritime.sn',
            'password': 'ong123',
            'role': 'organization',
            'phone': '+221 33 234 5678',
            'full_name': 'ONG Maritime Sénégal',
            'organization_name': 'ONG Maritime Sénégal',
            'organization_type': 'ngo',
            'emergency_contact': '+221 33 234 5679'
        }
    ]
    
    created_users = []
    for org_data in organizations_data:
        user, token = create_authenticated_user(org_data)
        if user:
            created_users.append({
                'user': user,
                'token': token,
                'credentials': {
                    'username': org_data['username'],
                    'email': org_data['email'],
                    'password': org_data['password']
                }
            })
        print()
    
    return created_users

def create_admin_users():
    """Créer des utilisateurs administrateurs"""
    print("👨‍💼 Création des utilisateurs administrateurs")
    print("=" * 50)
    
    admins_data = [
        {
            'username': 'admin_blue_track',
            'email': 'admin@blue-track.sn',
            'password': 'admin123',
            'role': 'admin',
            'phone': '+221 33 000 0000',
            'full_name': 'Administrateur Blue Track',
            'emergency_contact': '+221 33 000 0001'
        },
        {
            'username': 'superviseur_maritime',
            'email': 'superviseur@maritime.sn',
            'password': 'super123',
            'role': 'admin',
            'phone': '+221 33 111 1111',
            'full_name': 'Superviseur Maritime',
            'emergency_contact': '+221 33 111 1112'
        }
    ]
    
    created_users = []
    for admin_data in admins_data:
        user, token = create_authenticated_user(admin_data)
        if user:
            created_users.append({
                'user': user,
                'token': token,
                'credentials': {
                    'username': admin_data['username'],
                    'email': admin_data['email'],
                    'password': admin_data['password']
                }
            })
        print()
    
    return created_users

def test_authentication(users_list):
    """Tester l'authentification de tous les utilisateurs créés"""
    print("🔐 Test d'authentification")
    print("=" * 50)
    
    for user_info in users_list:
        credentials = user_info['credentials']
        user = user_info['user']
        
        print(f"Test de {credentials['username']} ({credentials['email']}):")
        
        # Test avec username
        auth_user = authenticate(username=credentials['username'], password=credentials['password'])
        if auth_user:
            print(f"  ✅ Authentification avec username: OK")
        else:
            print(f"  ❌ Authentification avec username: ÉCHEC")
        
        # Test avec email
        auth_user = authenticate(username=credentials['email'], password=credentials['password'])
        if auth_user:
            print(f"  ✅ Authentification avec email: OK")
        else:
            print(f"  ❌ Authentification avec email: ÉCHEC")
        
        print(f"  🔑 Token: {user_info['token'].key}")
        print()

def display_credentials_summary(all_users):
    """Afficher un résumé des identifiants créés"""
    print("📋 Résumé des identifiants créés")
    print("=" * 50)
    
    for user_info in all_users:
        credentials = user_info['credentials']
        user = user_info['user']
        
        print(f"👤 {user.profile.full_name} ({user.get_role_display()})")
        print(f"   📧 Email: {credentials['email']}")
        print(f"   👤 Username: {credentials['username']}")
        print(f"   🔑 Mot de passe: {credentials['password']}")
        print(f"   🎫 Token: {user_info['token'].key}")
        print()

def main():
    """Fonction principale"""
    print("🚀 Création d'utilisateurs authentifiables pour Blue Track")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    all_users = []
    
    # Créer les utilisateurs par catégorie
    fishermen = create_fisherman_users()
    organizations = create_organization_users()
    admins = create_admin_users()
    
    all_users.extend(fishermen)
    all_users.extend(organizations)
    all_users.extend(admins)
    
    # Tester l'authentification
    test_authentication(all_users)
    
    # Afficher le résumé
    display_credentials_summary(all_users)
    
    print("🎉 Création terminée!")
    print(f"✅ {len(all_users)} utilisateurs créés avec succès")
    print()
    print("📝 Instructions:")
    print("1. Les utilisateurs peuvent se connecter avec leur email ou username")
    print("2. Utilisez les tokens pour l'authentification API")
    print("3. Les pêcheurs ont accès à l'interface simplifiée")
    print("4. Les organisations et admins ont accès complet")

if __name__ == '__main__':
    main()
