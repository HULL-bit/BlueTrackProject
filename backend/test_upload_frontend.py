#!/usr/bin/env python3
"""
Test simple pour vérifier l'upload depuis le frontend
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

from django.contrib.auth import get_user_model
from apps.media.models import MediaFile

User = get_user_model()

def test_upload_api():
    """Test de l'API d'upload"""
    print("🧪 Test de l'API d'upload")
    print("=" * 50)
    
    # URL de l'API
    base_url = "http://localhost:8000"
    
    # 1. Créer un utilisateur de test
    try:
        user, created = User.objects.get_or_create(
            username='test_upload_user',
            defaults={
                'email': 'test@example.com',
                'role': 'organization'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Utilisateur de test créé: {user.username}")
        else:
            print(f"✅ Utilisateur de test existant: {user.username}")
    except Exception as e:
        print(f"❌ Erreur création utilisateur: {e}")
        return
    
    # 2. Se connecter pour obtenir un token
    try:
        login_data = {
            'username': 'test_upload_user',
            'password': 'testpass123',
            'email': 'test@example.com'
        }
        
        response = requests.post(f"{base_url}/api/users/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            print(f"✅ Token obtenu: {token[:20]}...")
        else:
            print(f"❌ Erreur login: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return
    
    # 3. Créer un fichier de test
    test_file_content = "Ceci est un fichier de test pour l'upload"
    test_file_path = "/tmp/test_upload.txt"
    
    with open(test_file_path, 'w') as f:
        f.write(test_file_content)
    
    # 4. Tester l'upload
    try:
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_upload.txt', f, 'text/plain')}
            data = {
                'name': 'Test Upload Frontend',
                'description': 'Fichier de test pour l\'upload frontend',
                'category': 'other',
                'is_public': 'true',
                'is_downloadable': 'true'
            }
            
            response = requests.post(
                f"{base_url}/api/media/files/",
                headers=headers,
                files=files,
                data=data
            )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Upload réussi!")
            print(f"   - ID: {result.get('id')}")
            print(f"   - Nom: {result.get('name')}")
            print(f"   - Type: {result.get('media_type')}")
            print(f"   - URL: {result.get('file_url')}")
        else:
            print(f"❌ Erreur upload: {response.status_code}")
            print(f"   Réponse: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
    
    # 5. Nettoyer
    try:
        os.remove(test_file_path)
        print("✅ Fichier de test supprimé")
    except:
        pass
    
    # 6. Vérifier en base
    try:
        files_count = MediaFile.objects.count()
        print(f"📊 Total fichiers en base: {files_count}")
        
        recent_files = MediaFile.objects.filter(
            uploaded_by=user
        ).order_by('-created_at')[:3]
        
        print("📋 Fichiers récents:")
        for file in recent_files:
            print(f"   - {file.name} ({file.media_type}) - {file.created_at}")
            
    except Exception as e:
        print(f"❌ Erreur vérification base: {e}")

if __name__ == "__main__":
    test_upload_api()
