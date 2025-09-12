#!/usr/bin/env python
"""
Script de test pour la galerie média
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.media.models import MediaFile, MediaCollection
from apps.users.models import User, UserProfile
from django.core.files.uploadedfile import SimpleUploadedFile
import json

User = get_user_model()

def create_test_media_files():
    """Créer des fichiers média de test"""
    print("🧪 Création de fichiers média de test...")
    
    # Créer un utilisateur de test
    user, created = User.objects.get_or_create(
        username='media_test_user',
        defaults={
            'email': 'media@example.com',
            'role': 'admin',
            'phone': '+221123456789'
        }
    )
    
    if created:
        UserProfile.objects.create(user=user, full_name='Media Test User')
        print(f"✅ Utilisateur de test créé: {user.username}")
    
    # Créer des fichiers de test
    test_files = [
        {
            'name': 'Photo de pêche',
            'original_name': 'peche_photo.jpg',
            'media_type': 'image',
            'category': 'fishing',
            'description': 'Photo d\'une sortie de pêche réussie',
            'tags': ['pêche', 'poisson', 'bateau'],
            'latitude': 14.7233,
            'longitude': -17.4605,
            'location_name': 'Port de Dakar',
            'width': 1920,
            'height': 1080,
            'is_public': True,
            'is_downloadable': True
        },
        {
            'name': 'Vidéo de navigation',
            'original_name': 'navigation_video.mp4',
            'media_type': 'video',
            'category': 'boats',
            'description': 'Vidéo de navigation en mer',
            'tags': ['navigation', 'mer', 'pirogue'],
            'latitude': 14.7250,
            'longitude': -17.4620,
            'location_name': 'Zone de pêche',
            'width': 1280,
            'height': 720,
            'duration': '00:05:30',
            'is_public': True,
            'is_downloadable': True
        },
        {
            'name': 'Document de licence',
            'original_name': 'licence_peche.pdf',
            'media_type': 'document',
            'category': 'fishing',
            'description': 'Licence de pêche officielle',
            'tags': ['licence', 'document', 'officiel'],
            'is_public': False,
            'is_downloadable': True
        }
    ]
    
    created_count = 0
    for file_data in test_files:
        # Créer un fichier de test simulé
        test_content = b'Test file content for ' + file_data['name'].encode()
        test_file = SimpleUploadedFile(
            file_data['original_name'],
            test_content,
            content_type='image/jpeg' if file_data['media_type'] == 'image' else 
                        'video/mp4' if file_data['media_type'] == 'video' else 
                        'application/pdf'
        )
        
        media_file, created = MediaFile.objects.get_or_create(
            name=file_data['name'],
            defaults={
                **file_data,
                'file': test_file,
                'size': len(test_content),
                'mime_type': test_file.content_type,
                'uploaded_by': user
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Fichier créé: {media_file.name} ({media_file.media_type})")
        else:
            print(f"ℹ️ Fichier existant: {media_file.name}")
    
    print(f"\n📊 Résumé: {created_count} nouveaux fichiers créés")
    return created_count

def test_media_api():
    """Tester l'API des médias"""
    print("\n🔍 Test de l'API des médias...")
    
    from django.test import Client
    from rest_framework.authtoken.models import Token
    
    client = Client()
    
    # Créer un token pour l'utilisateur de test
    user = User.objects.get(username='media_test_user')
    token, created = Token.objects.get_or_create(user=user)
    
    headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}
    
    try:
        # Test GET /api/media/files/
        response = client.get('/api/media/files/', **headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API médias fonctionne: {len(data.get('results', data))} fichiers trouvés")
            
            # Afficher les détails des fichiers
            files = data.get('results', data)
            for file in files[:3]:  # Afficher les 3 premiers
                print(f"   - {file['name']}: {file['media_type']} ({file['file_size_human']})")
        else:
            print(f"❌ Erreur API médias: {response.status_code}")
            print(f"   Réponse: {response.content}")
    
    except Exception as e:
        print(f"❌ Erreur lors du test API: {e}")
    
    try:
        # Test GET /api/media/stats/
        response = client.get('/api/media/stats/', **headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API statistiques fonctionne")
            print(f"   - Total fichiers: {data['global']['total_files']}")
            print(f"   - Taille totale: {data['global']['total_size_human']}")
            print(f"   - Par type: {data['by_type']}")
        else:
            print(f"❌ Erreur API statistiques: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Erreur lors du test API statistiques: {e}")

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
    print("5. Aller dans le menu 'Galerie Média'")
    print("6. Tester les fonctionnalités:")
    print("   - Upload de fichiers (images, vidéos, documents)")
    print("   - Prévisualisation des fichiers")
    print("   - Téléchargement des fichiers")
    print("   - Suppression des fichiers")
    print("   - Recherche et filtres")
    print("   - Modes d'affichage (grille/liste)")
    print("   - Actions en lot")

def main():
    """Fonction principale"""
    print("🚀 Test de la galerie média complète")
    print("=" * 60)
    
    # Vérifier le stockage
    test_file_storage()
    
    # Vérifier les fichiers existants
    check_media_files_in_database()
    
    # Créer des fichiers de test
    created_count = create_test_media_files()
    
    # Tester l'API
    test_media_api()
    
    # Instructions frontend
    test_frontend_integration()
    
    print("\n🎉 Tests terminés!")
    print(f"✅ {created_count} fichiers de test créés")
    print("✅ API testée")
    print("✅ Stockage vérifié")
    print("✅ Instructions frontend fournies")

if __name__ == '__main__':
    main()
