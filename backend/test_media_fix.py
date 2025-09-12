#!/usr/bin/env python
"""
Script de test pour vérifier la correction de la galerie média
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from apps.media.models import MediaFile
import json

User = get_user_model()

def test_media_api_endpoints():
    """Tester tous les endpoints de l'API média"""
    print("🧪 Test des endpoints API média...")
    
    client = Client()
    
    # Créer un utilisateur de test
    user, created = User.objects.get_or_create(
        username='api_test_user',
        defaults={
            'email': 'api@example.com',
            'role': 'admin',
            'phone': '+221123456789'
        }
    )
    
    if created:
        from apps.users.models import UserProfile
        UserProfile.objects.create(user=user, full_name='API Test User')
        print(f"✅ Utilisateur de test créé: {user.username}")
    
    # Créer un token
    token, created = Token.objects.get_or_create(user=user)
    headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}
    
    # Test 1: GET /api/media/files/
    print("\n1. Test GET /api/media/files/")
    try:
        response = client.get('/api/media/files/', **headers)
        if response.status_code == 200:
            data = response.json()
            files = data.get('results', data)
            print(f"✅ Succès: {len(files)} fichiers trouvés")
            
            # Afficher les détails des fichiers
            for file in files[:3]:
                print(f"   - {file['name']}: {file['media_type']} ({file['file_size_human']})")
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"   Réponse: {response.content}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 2: GET /api/media/stats/
    print("\n2. Test GET /api/media/stats/")
    try:
        response = client.get('/api/media/stats/', **headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès: Statistiques récupérées")
            print(f"   - Total fichiers: {data['global']['total_files']}")
            print(f"   - Taille totale: {data['global']['total_size_human']}")
            print(f"   - Par type: {data['by_type']}")
        else:
            print(f"❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 3: GET /api/media/collections/
    print("\n3. Test GET /api/media/collections/")
    try:
        response = client.get('/api/media/collections/', **headers)
        if response.status_code == 200:
            data = response.json()
            collections = data.get('results', data)
            print(f"✅ Succès: {len(collections)} collections trouvées")
        else:
            print(f"❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_media_file_creation():
    """Tester la création d'un fichier média"""
    print("\n🧪 Test de création de fichier média...")
    
    client = Client()
    
    # Créer un utilisateur de test
    user, created = User.objects.get_or_create(
        username='upload_test_user',
        defaults={
            'email': 'upload@example.com',
            'role': 'admin',
            'phone': '+221123456789'
        }
    )
    
    if created:
        from apps.users.models import UserProfile
        UserProfile.objects.create(user=user, full_name='Upload Test User')
        print(f"✅ Utilisateur de test créé: {user.username}")
    
    # Créer un token
    token, created = Token.objects.get_or_create(user=user)
    headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}
    
    # Créer un fichier de test
    from django.core.files.uploadedfile import SimpleUploadedFile
    test_content = b'Test file content for upload test'
    test_file = SimpleUploadedFile(
        'test_upload.txt',
        test_content,
        content_type='text/plain'
    )
    
    # Test POST /api/media/files/
    print("\n4. Test POST /api/media/files/")
    try:
        data = {
            'file': test_file,
            'name': 'Fichier de test upload',
            'description': 'Fichier créé pour tester l\'upload',
            'category': 'other',
            'is_public': 'true',
            'is_downloadable': 'true'
        }
        
        response = client.post('/api/media/files/', data, **headers)
        if response.status_code == 201:
            file_data = response.json()
            print(f"✅ Succès: Fichier créé avec ID {file_data['id']}")
            print(f"   - Nom: {file_data['name']}")
            print(f"   - Type: {file_data['media_type']}")
            print(f"   - Taille: {file_data['file_size_human']}")
            print(f"   - URL: {file_data['file_url']}")
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"   Réponse: {response.content}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def check_media_files_in_database():
    """Vérifier les fichiers média en base de données"""
    print("\n🗄️ Vérification des fichiers média en base de données...")
    
    files = MediaFile.objects.all()
    print(f"📊 Total des fichiers en base: {files.count()}")
    
    if files.count() > 0:
        print("\n📋 Détails des fichiers:")
        for file in files:
            print(f"   - ID: {file.id}")
            print(f"     Nom: {file.name}")
            print(f"     Type: {file.media_type}")
            print(f"     Catégorie: {file.category}")
            print(f"     Taille: {file.file_size_human}")
            print(f"     Public: {file.is_public}")
            print(f"     Téléchargeable: {file.is_downloadable}")
            print(f"     Uploadé par: {file.uploaded_by.username}")
            print(f"     Créé le: {file.created_at}")
            print(f"     URL: {file.file_url}")
            print()
    else:
        print("⚠️ Aucun fichier trouvé en base de données")

def test_file_storage():
    """Tester le stockage des fichiers"""
    print("\n💾 Test du stockage des fichiers...")
    
    import os
    from django.conf import settings
    
    media_root = settings.MEDIA_ROOT
    media_gallery_path = os.path.join(media_root, 'media_gallery')
    
    print(f"📁 Dossier média: {media_root}")
    print(f"📁 Dossier galerie: {media_gallery_path}")
    
    if os.path.exists(media_gallery_path):
        files = os.listdir(media_gallery_path)
        print(f"✅ Dossier galerie existe avec {len(files)} fichiers")
        for file in files[:5]:  # Afficher les 5 premiers
            print(f"   - {file}")
    else:
        print("❌ Dossier galerie n'existe pas")
        print("   Création du dossier...")
        os.makedirs(media_gallery_path, exist_ok=True)
        print("✅ Dossier créé")

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
    print("4. Se connecter avec un compte")
    print("5. Tester les composants:")
    print("   - Menu 'Galerie Média' (MediaGalleryComplete)")
    print("   - Vérifier qu'il n'y a plus de conflit avec le dashboard")
    print("   - Tester l'upload de fichiers")
    print("   - Tester la prévisualisation")
    print("   - Tester le téléchargement")
    print("   - Tester la suppression")
    print()
    print("6. Vérifier les fonctionnalités:")
    print("   - Upload multiple")
    print("   - Support vidéos")
    print("   - Recherche et filtres")
    print("   - Modes d'affichage")
    print("   - Actions en lot")

def main():
    """Fonction principale"""
    print("🚀 Test de la correction de la galerie média")
    print("=" * 60)
    
    # Vérifier le stockage
    test_file_storage()
    
    # Vérifier les fichiers existants
    check_media_files_in_database()
    
    # Tester les endpoints API
    test_media_api_endpoints()
    
    # Tester la création de fichiers
    test_media_file_creation()
    
    # Instructions frontend
    test_frontend_integration()
    
    print("\n🎉 Tests terminés!")
    print("✅ API testée")
    print("✅ Stockage vérifié")
    print("✅ Création de fichiers testée")
    print("✅ Instructions frontend fournies")

if __name__ == '__main__':
    main()
