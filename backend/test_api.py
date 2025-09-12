#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework.test import APIClient
from apps.users.models import User

def test_django_api():
    print("🧪 Test des API Django...")
    
    # Créer un client API
    client = APIClient()
    
    # Test 1: Authentification
    print("\n1. Test d'authentification...")
    user = User.objects.filter(username='admin').first()
    if user:
        # Définir le mot de passe
        user.set_password('admin123')
        user.save()
        
        # Authentifier
        auth_response = client.post('/api/users/login/', {
            'email': 'admin@blue-track.com',
            'password': 'admin123'
        })
        
        if auth_response.status_code == 200:
            print("✅ Authentification réussie")
            token = auth_response.data.get('token')
            if token:
                client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        else:
            print(f"❌ Échec authentification: {auth_response.status_code}")
            print(auth_response.data)
    else:
        print("❌ Utilisateur admin non trouvé")
    
    # Test 2: Récupérer les utilisateurs
    print("\n2. Test récupération utilisateurs...")
    users_response = client.get('/api/users/')
    if users_response.status_code == 200:
        users = users_response.data
        print(f"✅ {len(users)} utilisateurs récupérés")
        for user in users[:3]:  # Afficher les 3 premiers
            print(f"   - {user.get('username', 'N/A')} ({user.get('role', 'N/A')})")
    else:
        print(f"❌ Échec récupération utilisateurs: {users_response.status_code}")
    
    # Test 3: Récupérer les positions GPS
    print("\n3. Test récupération positions GPS...")
    locations_response = client.get('/api/tracking/locations/')
    if locations_response.status_code == 200:
        locations = locations_response.data
        print(f"✅ {len(locations)} positions GPS récupérées")
        print(f"   Type de données: {type(locations)}")
        if isinstance(locations, dict) and 'results' in locations:
            locations_list = locations['results']
        else:
            locations_list = locations if isinstance(locations, list) else []
        
        for i, loc in enumerate(locations_list):
            if i >= 3:  # Afficher seulement les 3 premières
                break
            if isinstance(loc, dict):
                print(f"   - {loc.get('latitude', 'N/A')}, {loc.get('longitude', 'N/A')}")
            else:
                print(f"   - {loc}")
    else:
        print(f"❌ Échec récupération positions: {locations_response.status_code}")
    
    # Test 4: Récupérer les zones
    print("\n4. Test récupération zones...")
    zones_response = client.get('/api/zones/')
    if zones_response.status_code == 200:
        zones = zones_response.data
        print(f"✅ {len(zones)} zones récupérées")
        if isinstance(zones, dict) and 'results' in zones:
            zones_list = zones['results']
        else:
            zones_list = zones if isinstance(zones, list) else []
        
        for zone in zones_list:
            if isinstance(zone, dict):
                print(f"   - {zone.get('name', 'N/A')} ({zone.get('zone_type', 'N/A')})")
            else:
                print(f"   - {zone}")
    else:
        print(f"❌ Échec récupération zones: {zones_response.status_code}")
    
    # Test 5: Récupérer les alertes
    print("\n5. Test récupération alertes...")
    alerts_response = client.get('/api/alerts/')
    if alerts_response.status_code == 200:
        alerts = alerts_response.data
        print(f"✅ {len(alerts)} alertes récupérées")
        if isinstance(alerts, dict) and 'results' in alerts:
            alerts_list = alerts['results']
        else:
            alerts_list = alerts if isinstance(alerts, list) else []
        
        for alert in alerts_list:
            if isinstance(alert, dict):
                print(f"   - {alert.get('alert_type', 'N/A')} ({alert.get('severity', 'N/A')})")
            else:
                print(f"   - {alert}")
    else:
        print(f"❌ Échec récupération alertes: {alerts_response.status_code}")
    
    # Test 6: Récupérer les messages
    print("\n6. Test récupération messages...")
    messages_response = client.get('/api/communication/messages/')
    if messages_response.status_code == 200:
        messages = messages_response.data
        print(f"✅ {len(messages)} messages récupérés")
        if isinstance(messages, dict) and 'results' in messages:
            messages_list = messages['results']
        else:
            messages_list = messages if isinstance(messages, list) else []
        
        for i, msg in enumerate(messages_list):
            if i >= 3:  # Afficher seulement les 3 premiers
                break
            if isinstance(msg, dict):
                content = msg.get('content', 'N/A')
                print(f"   - {content[:50] if isinstance(content, str) else content}...")
            else:
                print(f"   - {msg}")
    else:
        print(f"❌ Échec récupération messages: {messages_response.status_code}")
    
    print("\n🎉 Tests terminés!")

if __name__ == '__main__':
    test_django_api()
