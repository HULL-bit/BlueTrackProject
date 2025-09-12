#!/usr/bin/env python3
"""
Script pour tester l'authentification des utilisateurs
"""
import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api"
LOGIN_ENDPOINT = f"{API_BASE_URL}/users/login/"

def test_login(credentials):
    """Tester la connexion d'un utilisateur"""
    print(f"🔐 Test de connexion pour {credentials['username']}")
    
    try:
        # Test avec email
        login_data = {
            "email": credentials['email'],
            "password": credentials['password']
        }
        
        response = requests.post(
            LOGIN_ENDPOINT,
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Connexion réussie avec email")
            print(f"  🎫 Token: {data.get('token', 'N/A')}")
            print(f"  👤 Utilisateur: {data.get('user', {}).get('username', 'N/A')}")
            print(f"  🏷️ Rôle: {data.get('user', {}).get('role', 'N/A')}")
            return data.get('token')
        else:
            print(f"  ❌ Erreur de connexion: {response.status_code}")
            print(f"  📝 Détails: {response.text}")
            return None
            
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return None

def test_protected_endpoint(token, endpoint_name, endpoint_url):
    """Tester l'accès à un endpoint protégé"""
    print(f"🔒 Test d'accès à {endpoint_name}")
    
    try:
        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(endpoint_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"  ✅ Accès autorisé à {endpoint_name}")
            return True
        else:
            print(f"  ❌ Accès refusé à {endpoint_name}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return False

def test_user_roles():
    """Tester les différents rôles d'utilisateurs"""
    print("🧪 Test des rôles d'utilisateurs")
    print("=" * 50)
    
    # Identifiants de test (à adapter selon vos utilisateurs créés)
    test_users = [
        {
            'username': 'moussa_diop',
            'email': 'moussa.diop@example.com',
            'password': 'moussa123',
            'role': 'fisherman'
        },
        {
            'username': 'gie_pecheurs_cayar',
            'email': 'contact@gie-cayar.sn',
            'password': 'gie123',
            'role': 'organization'
        },
        {
            'username': 'admin_blue_track',
            'email': 'admin@blue-track.sn',
            'password': 'admin123',
            'role': 'admin'
        }
    ]
    
    endpoints_to_test = [
        ('Positions GPS', f"{API_BASE_URL}/tracking/live-positions/"),
        ('Dispositifs', f"{API_BASE_URL}/tracking/devices/"),
        ('Balises', f"{API_BASE_URL}/tracking/balises/"),
        ('Zones', f"{API_BASE_URL}/zones/"),
        ('Utilisateurs', f"{API_BASE_URL}/users/")
    ]
    
    for user_credentials in test_users:
        print(f"\n👤 Test pour {user_credentials['username']} ({user_credentials['role']})")
        print("-" * 40)
        
        # Tester la connexion
        token = test_login(user_credentials)
        
        if token:
            print(f"\n🔍 Test des permissions pour le rôle {user_credentials['role']}:")
            
            for endpoint_name, endpoint_url in endpoints_to_test:
                test_protected_endpoint(token, endpoint_name, endpoint_url)
        
        print()

def test_gps_webhook():
    """Tester l'envoi de données GPS"""
    print("📡 Test de l'envoi de données GPS")
    print("=" * 50)
    
    gps_data = {
        "device_id": "TRK001",
        "imei": "123456789012345",
        "latitude": 14.7167,
        "longitude": -17.4677,
        "speed": 5.5,
        "heading": 180,
        "altitude": 2.0,
        "accuracy": 8.5,
        "battery_level": 85,
        "signal_strength": 4,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/tracking/webhook/tracker/",
            json=gps_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Données GPS envoyées avec succès")
            print(f"📝 Réponse: {data}")
        else:
            print(f"❌ Erreur envoi GPS: {response.status_code}")
            print(f"📝 Détails: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_live_positions():
    """Tester la récupération des positions en temps réel"""
    print("\n📍 Test des positions en temps réel")
    print("=" * 50)
    
    try:
        response = requests.get(f"{API_BASE_URL}/tracking/live-positions/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['metadata']['total_positions']} positions récupérées")
            
            for feature in data['features']:
                props = feature['properties']
                coords = feature['geometry']['coordinates']
                print(f"  📍 {props['full_name']} ({props['device_id']}): {coords[1]:.6f}, {coords[0]:.6f}")
        else:
            print(f"❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def main():
    """Fonction principale"""
    print("🧪 Test complet du système d'authentification")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: Rôles d'utilisateurs
    test_user_roles()
    
    # Test 2: Envoi de données GPS
    test_gps_webhook()
    
    # Test 3: Positions en temps réel
    test_live_positions()
    
    print("\n🎉 Tests terminés!")
    print("\n📋 URLs utiles:")
    print(f"  🔐 Connexion: {LOGIN_ENDPOINT}")
    print(f"  📍 Positions: {API_BASE_URL}/tracking/live-positions/")
    print(f"  📡 Webhook GPS: {API_BASE_URL}/tracking/webhook/tracker/")

if __name__ == '__main__':
    main()
