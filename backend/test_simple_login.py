#!/usr/bin/env python3
"""
Test simple de connexion
"""
import requests
import json

def test_simple_login():
    """Test simple de connexion"""
    url = "http://localhost:8000/api/users/login/"
    
    # Test avec des données valides
    data = {
        "email": "test_debug@example.com",
        "password": "testpass123"
    }
    
    print(f"🔍 Test de connexion simple:")
    print(f"   URL: {url}")
    print(f"   Données: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, headers={
            'Content-Type': 'application/json'
        })
        
        print(f"\n📊 Réponse:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Connexion réussie!")
            return True
        else:
            print("❌ Connexion échouée")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la requête: {e}")
        return False

if __name__ == "__main__":
    test_simple_login()
