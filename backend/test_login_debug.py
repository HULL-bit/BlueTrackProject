#!/usr/bin/env python3
"""
Script de test pour déboguer les problèmes de connexion
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/users/login/"

def test_login(email, password):
    """Test de connexion avec des données spécifiques"""
    data = {
        "email": email,
        "password": password
    }
    
    print(f"🔍 Test de connexion avec:")
    print(f"   Email: {email}")
    print(f"   Password: {'*' * len(password)}")
    print(f"   URL: {LOGIN_URL}")
    print(f"   Données: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(LOGIN_URL, json=data, headers={
            'Content-Type': 'application/json'
        })
        
        print(f"\n📊 Réponse:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"   Body: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
        except:
            print(f"   Body (raw): {response.text}")
            
        return response.status_code == 200, response
        
    except Exception as e:
        print(f"❌ Erreur lors de la requête: {e}")
        return False, None

def test_register_and_login():
    """Test d'inscription puis de connexion"""
    # Données de test
    test_user = {
        "username": "test_user_debug",
        "email": "test_debug@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123",
        "role": "fisherman",
        "phone": "1234567890",
        "profile": {
            "full_name": "Test User Debug",
            "boat_name": "Test Boat",
            "license_number": "TEST123"
        }
    }
    
    print("=" * 60)
    print("🧪 TEST D'INSCRIPTION ET CONNEXION")
    print("=" * 60)
    
    # Test d'inscription
    print("\n1️⃣ Test d'inscription...")
    register_url = f"{BASE_URL}/users/register/"
    
    try:
        register_response = requests.post(register_url, json=test_user, headers={
            'Content-Type': 'application/json'
        })
        
        print(f"   Status Code: {register_response.status_code}")
        print(f"   Response: {register_response.text}")
        
        if register_response.status_code == 201:
            print("✅ Inscription réussie")
            
            # Test de connexion avec l'email
            print("\n2️⃣ Test de connexion avec l'email...")
            success, response = test_login(test_user["email"], test_user["password"])
            
            if success:
                print("✅ Connexion avec email réussie")
            else:
                print("❌ Connexion avec email échouée")
                
            # Test de connexion avec le username
            print("\n3️⃣ Test de connexion avec le username...")
            success, response = test_login(test_user["username"], test_user["password"])
            
            if success:
                print("✅ Connexion avec username réussie")
            else:
                print("❌ Connexion avec username échouée")
                
        else:
            print("❌ Inscription échouée")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'inscription: {e}")

def test_existing_user_login():
    """Test de connexion avec un utilisateur existant"""
    print("\n" + "=" * 60)
    print("🔍 TEST DE CONNEXION UTILISATEUR EXISTANT")
    print("=" * 60)
    
    # Récupérer la liste des utilisateurs existants
    try:
        users_response = requests.get(f"{BASE_URL}/users/users/", headers={
            'Authorization': 'Token your_token_here'  # On va ignorer l'auth pour ce test
        })
        
        if users_response.status_code == 200:
            users = users_response.json()
            if users:
                user = users[0]
                print(f"Utilisateur trouvé: {user.get('username', 'N/A')} ({user.get('email', 'N/A')})")
                
                # Test de connexion
                print("\n🔐 Test de connexion...")
                # On va essayer avec un mot de passe par défaut
                test_passwords = ["admin123", "password", "test123", "123456"]
                
                for password in test_passwords:
                    print(f"\n   Tentative avec mot de passe: {password}")
                    success, response = test_login(user.get('email', ''), password)
                    if success:
                        print("✅ Connexion réussie!")
                        break
                    else:
                        print("❌ Échec")
            else:
                print("Aucun utilisateur trouvé")
        else:
            print(f"Impossible de récupérer les utilisateurs: {users_response.status_code}")
            
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    print("🚀 Démarrage du test de débogage de connexion")
    
    # Test 1: Inscription et connexion
    test_register_and_login()
    
    # Test 2: Connexion utilisateur existant
    test_existing_user_login()
    
    print("\n" + "=" * 60)
    print("🏁 Tests terminés")
    print("=" * 60)
