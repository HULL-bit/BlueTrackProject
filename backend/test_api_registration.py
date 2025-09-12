#!/usr/bin/env python3
"""
Script pour tester l'API d'inscription directement
"""
import os
import sys
import django
import requests
import json

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/ProjetOuagadou-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

def test_api_registration():
    """Tester l'API d'inscription"""
    print("=== Test API d'inscription ===")
    
    # URL de l'API
    url = "http://localhost:8000/api/users/register/"
    
    # Données de test similaires au frontend
    test_data = {
        "email": "api_test@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123",
        "role": "fisherman",
        "phone": "+221 77 888 8888",
        "profile": {
            "full_name": "API Test User",
            "boat_name": "API Test Boat",
            "license_number": "API123"
        }
    }
    
    try:
        # Faire la requête POST
        response = requests.post(url, json=test_data, headers={
            'Content-Type': 'application/json'
        })
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Inscription réussie!")
            print(f"   Token: {data.get('token', 'N/A')}")
            print(f"   User: {data.get('user', {}).get('username', 'N/A')}")
            
            # Tester la connexion avec les nouvelles données
            login_url = "http://localhost:8000/api/users/login/"
            login_data = {
                "email": test_data["email"],
                "password": test_data["password"]
            }
            
            login_response = requests.post(login_url, json=login_data, headers={
                'Content-Type': 'application/json'
            })
            
            print(f"\nTest de connexion:")
            print(f"Status Code: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
            if login_response.status_code == 200:
                print(f"✅ Connexion réussie!")
            else:
                print(f"❌ Connexion échouée")
                
        else:
            print(f"❌ Erreur d'inscription: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur. Assurez-vous que le serveur Django est démarré.")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == '__main__':
    test_api_registration()
