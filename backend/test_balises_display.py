#!/usr/bin/env python
"""
Script de test pour vérifier l'affichage des balises sur les cartes
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.tracking.models import Balise
from apps.users.models import User, UserProfile
import json

User = get_user_model()

def create_test_balises():
    """Créer des balises de test pour vérifier l'affichage"""
    print("🧪 Création de balises de test...")
    
    # Créer un utilisateur de test s'il n'existe pas
    user, created = User.objects.get_or_create(
        username='test_user',
        defaults={
            'email': 'test@example.com',
            'role': 'admin',
            'phone': '+221123456789'
        }
    )
    
    if created:
        UserProfile.objects.create(user=user, full_name='Test User')
        print(f"✅ Utilisateur de test créé: {user.username}")
    else:
        print(f"✅ Utilisateur de test existant: {user.username}")
    
    # Coordonnées de test autour de Dakar
    test_balises = [
        {
            'name': 'Balise GPS Port de Dakar',
            'balise_type': 'gps',
            'status': 'active',
            'latitude': 14.7233,
            'longitude': -17.4605,
            'vessel_name': 'Pirogue Alpha',
            'battery_level': 85,
            'signal_strength': 95,
            'frequency': '433.92 MHz',
            'power': '10W',
            'notes': 'Balise principale du port'
        },
        {
            'name': 'Balise VMS Zone de Pêche',
            'balise_type': 'vms',
            'status': 'active',
            'latitude': 14.7250,
            'longitude': -17.4620,
            'vessel_name': 'Pirogue Beta',
            'battery_level': 72,
            'signal_strength': 88,
            'frequency': '162.4 MHz',
            'power': '5W',
            'notes': 'Surveillance zone de pêche'
        },
        {
            'name': 'Balise AIS Navigation',
            'balise_type': 'ais',
            'status': 'active',
            'latitude': 14.7200,
            'longitude': -17.4580,
            'vessel_name': 'Pirogue Gamma',
            'battery_level': 90,
            'signal_strength': 92,
            'frequency': '161.975 MHz',
            'power': '2W',
            'notes': 'Navigation côtière'
        },
        {
            'name': 'Balise Urgence',
            'balise_type': 'emergency',
            'status': 'active',
            'latitude': 14.7180,
            'longitude': -17.4550,
            'vessel_name': 'Pirogue Delta',
            'battery_level': 100,
            'signal_strength': 98,
            'frequency': '406 MHz',
            'power': '5W',
            'notes': 'Balise de secours'
        },
        {
            'name': 'Balise Maintenance',
            'balise_type': 'gps',
            'status': 'maintenance',
            'latitude': 14.7300,
            'longitude': -17.4650,
            'vessel_name': 'Pirogue Epsilon',
            'battery_level': 45,
            'signal_strength': 60,
            'frequency': '433.92 MHz',
            'power': '10W',
            'notes': 'En maintenance'
        }
    ]
    
    created_count = 0
    for balise_data in test_balises:
        balise, created = Balise.objects.get_or_create(
            name=balise_data['name'],
            defaults={
                **balise_data,
                'created_by': user
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Balise créée: {balise.name} ({balise.balise_type})")
        else:
            print(f"ℹ️ Balise existante: {balise.name}")
    
    print(f"\n📊 Résumé: {created_count} nouvelles balises créées")
    return created_count

def test_balises_api():
    """Tester l'API des balises"""
    print("\n🔍 Test de l'API des balises...")
    
    from django.test import Client
    from rest_framework.authtoken.models import Token
    
    client = Client()
    
    # Créer un token pour l'utilisateur de test
    user = User.objects.get(username='test_user')
    token, created = Token.objects.get_or_create(user=user)
    
    # Test de l'API des balises
    headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}
    
    try:
        # Test GET /api/tracking/balises/
        response = client.get('/api/tracking/balises/', **headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API balises fonctionne: {len(data.get('results', data))} balises trouvées")
            
            # Afficher les détails des balises
            balises = data.get('results', data)
            for balise in balises[:3]:  # Afficher les 3 premières
                print(f"   - {balise['name']}: {balise['balise_type']} ({balise['status']})")
        else:
            print(f"❌ Erreur API balises: {response.status_code}")
            print(f"   Réponse: {response.content}")
    
    except Exception as e:
        print(f"❌ Erreur lors du test API: {e}")
    
    try:
        # Test GET /api/tracking/balises/geojson/
        response = client.get('/api/tracking/balises/geojson/', **headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API GeoJSON fonctionne: {len(data.get('features', []))} features trouvées")
            
            # Afficher les détails GeoJSON
            features = data.get('features', [])
            for feature in features[:2]:  # Afficher les 2 premières
                props = feature.get('properties', {})
                coords = feature.get('geometry', {}).get('coordinates', [])
                print(f"   - {props.get('name')}: [{coords[1]:.6f}, {coords[0]:.6f}]")
        else:
            print(f"❌ Erreur API GeoJSON: {response.status_code}")
            print(f"   Réponse: {response.content}")
    
    except Exception as e:
        print(f"❌ Erreur lors du test API GeoJSON: {e}")

def check_balises_in_database():
    """Vérifier les balises en base de données"""
    print("\n🗄️ Vérification des balises en base de données...")
    
    balises = Balise.objects.all()
    print(f"📊 Total des balises en base: {balises.count()}")
    
    if balises.count() > 0:
        print("\n📋 Détails des balises:")
        for balise in balises:
            print(f"   - ID: {balise.id}")
            print(f"     Nom: {balise.name}")
            print(f"     Type: {balise.balise_type} ({balise.get_balise_type_display()})")
            print(f"     Statut: {balise.status} ({balise.get_status_display()})")
            print(f"     Position: {balise.latitude}, {balise.longitude}")
            print(f"     Créé par: {balise.created_by.username}")
            print(f"     Créé le: {balise.created_at}")
            print()
    else:
        print("⚠️ Aucune balise trouvée en base de données")

def test_frontend_integration():
    """Instructions pour tester l'intégration frontend"""
    print("\n🌐 Instructions pour tester l'intégration frontend:")
    print("1. Démarrer le serveur Django:")
    print("   python manage.py runserver")
    print()
    print("2. Démarrer le serveur frontend:")
    print("   cd .. && npm run dev")
    print()
    print("3. Ouvrir l'application dans le navigateur:")
    print("   http://localhost:5173")
    print()
    print("4. Se connecter avec un compte admin/organization")
    print("5. Aller sur la carte marine ou GPS tracking")
    print("6. Vérifier que les balises s'affichent avec:")
    print("   - Icônes colorées selon le type")
    print("   - Popups avec informations détaillées")
    print("   - Couleurs selon le statut (vert=actif, rouge=erreur, etc.)")

def main():
    """Fonction principale"""
    print("🚀 Test de l'affichage des balises sur les cartes")
    print("=" * 60)
    
    # Vérifier les balises existantes
    check_balises_in_database()
    
    # Créer des balises de test
    created_count = create_test_balises()
    
    # Tester l'API
    test_balises_api()
    
    # Instructions frontend
    test_frontend_integration()
    
    print("\n🎉 Tests terminés!")
    print(f"✅ {created_count} balises de test créées")
    print("✅ API testée")
    print("✅ Instructions frontend fournies")

if __name__ == '__main__':
    main()
