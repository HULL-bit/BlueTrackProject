#!/usr/bin/env python
import os
import sys
import django
import requests
from io import BytesIO
from PIL import Image

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from rest_framework.test import APIClient
from apps.users.models import User

def test_image_upload():
    print("🧪 Test de l'upload d'images...")
    
    # Créer un client API
    client = APIClient()
    
    # Authentifier
    print("\n1. Authentification...")
    user = User.objects.filter(username='admin').first()
    if user:
        user.set_password('admin123')
        user.save()
        
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
            return
    else:
        print("❌ Utilisateur admin non trouvé")
        return
    
    # Créer une image de test
    print("\n2. Création d'une image de test...")
    try:
        # Créer une image simple avec PIL
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='JPEG')
        img_io.seek(0)
        
        print("✅ Image de test créée")
    except Exception as e:
        print(f"❌ Erreur création image: {e}")
        return
    
    # Test upload d'image
    print("\n3. Test upload d'image...")
    try:
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        image_file = SimpleUploadedFile(
            "test_image.jpg",
            img_io.getvalue(),
            content_type="image/jpeg"
        )
        
        upload_data = {
            'image': image_file,
            'channel_id': 'general'
        }
        
        upload_response = client.post('/api/communication/upload-image/', upload_data, format='multipart')
        
        if upload_response.status_code == 201:
            print("✅ Upload d'image réussi")
            result = upload_response.data
            print(f"   Message ID: {result['data']['id']}")
            print(f"   Type: {result['data']['type']}")
            print(f"   Image URL: {result['data']['image_url']}")
        else:
            print(f"❌ Échec upload: {upload_response.status_code}")
            print(f"   Erreur: {upload_response.data}")
            
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
    
    # Vérifier que le message a été créé
    print("\n4. Vérification du message créé...")
    try:
        messages_response = client.get('/api/communication/messages/')
        if messages_response.status_code == 200:
            messages = messages_response.data
            if isinstance(messages, dict) and 'results' in messages:
                messages_list = messages['results']
            else:
                messages_list = messages if isinstance(messages, list) else []
            
            image_messages = [msg for msg in messages_list if msg.get('type') == 'image']
            print(f"✅ {len(image_messages)} message(s) avec image trouvé(s)")
            
            for msg in image_messages:
                print(f"   - ID: {msg.get('id')}")
                print(f"   - Contenu: {msg.get('content')}")
                print(f"   - Image URL: {msg.get('image_url')}")
        else:
            print(f"❌ Échec récupération messages: {messages_response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur vérification: {e}")
    
    print("\n🎉 Test terminé!")

if __name__ == '__main__':
    test_image_upload()
