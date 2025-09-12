#!/usr/bin/env python3
"""
Script de test pour la galerie média complète
Teste l'upload, l'affichage, les likes et commentaires
"""

import requests
import json
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_media_gallery():
    """Test complet de la galerie média"""
    
    print("🧪 Test de la galerie média complète")
    print("=" * 50)
    
    # 1. Connexion
    print("\n1. Connexion utilisateur...")
    login_data = {
        "email": "admin@blue-track.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/users/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('token')
            headers = {'Authorization': f'Token {token}'}
            print("✅ Connexion réussie")
        else:
            print(f"❌ Erreur de connexion: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # 2. Créer un fichier de test
    print("\n2. Création d'un fichier de test...")
    test_file_path = Path(__file__).parent / "test_image.txt"
    with open(test_file_path, 'w') as f:
        f.write("Ceci est un fichier de test pour la galerie média")
    
    # 3. Upload du fichier
    print("\n3. Upload du fichier...")
    try:
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_image.txt', f, 'text/plain')}
            data = {
                'name': 'Fichier de test',
                'description': 'Description du fichier de test',
                'category': 'other',
                'is_public': 'true',
                'is_downloadable': 'true'
            }
            
            response = requests.post(
                f"{API_BASE}/media/files/",
                files=files,
                data=data,
                headers=headers
            )
            
            if response.status_code == 201:
                media_data = response.json()
                print(f"✅ Réponse upload: {json.dumps(media_data, indent=2)}")
                media_id = media_data['id']
                print(f"✅ Fichier uploadé avec succès - ID: {media_id}")
                print(f"   Nom: {media_data.get('name', 'N/A')}")
                print(f"   Type: {media_data.get('media_type', 'N/A')}")
                print(f"   Taille: {media_data.get('file_size_human', 'N/A')}")
            else:
                print(f"❌ Erreur upload: {response.status_code} - {response.text}")
                return
    except Exception as e:
        print(f"❌ Erreur upload: {e}")
        return
    
    # 4. Récupérer la liste des fichiers
    print("\n4. Récupération de la liste des fichiers...")
    try:
        response = requests.get(f"{API_BASE}/media/files/", headers=headers)
        if response.status_code == 200:
            files_data = response.json()
            files_list = files_data.get('results', files_data)
            print(f"✅ {len(files_list)} fichier(s) trouvé(s)")
            
            for file in files_list:
                print(f"   - {file['name']} ({file['media_type']}) - {file['like_count']} likes")
        else:
            print(f"❌ Erreur récupération: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur récupération: {e}")
    
    # 5. Tester le like
    print("\n5. Test du système de like...")
    try:
        # Ajouter un like
        response = requests.post(f"{API_BASE}/media/files/{media_id}/like/", headers=headers)
        if response.status_code in [200, 201]:
            print("✅ Like ajouté avec succès")
        else:
            print(f"❌ Erreur like: {response.status_code} - {response.text}")
        
        # Vérifier le fichier mis à jour
        response = requests.get(f"{API_BASE}/media/files/{media_id}/", headers=headers)
        if response.status_code == 200:
            updated_file = response.json()
            print(f"   Nombre de likes: {updated_file['like_count']}")
            print(f"   Est liké par l'utilisateur: {updated_file['is_liked']}")
    except Exception as e:
        print(f"❌ Erreur like: {e}")
    
    # 6. Tester les commentaires
    print("\n6. Test du système de commentaires...")
    try:
        # Ajouter un commentaire
        comment_data = {'content': 'Ceci est un commentaire de test sur le fichier média'}
        response = requests.post(
            f"{API_BASE}/media/files/{media_id}/comments/",
            json=comment_data,
            headers=headers
        )
        
        if response.status_code == 201:
            print("✅ Commentaire ajouté avec succès")
        else:
            print(f"❌ Erreur commentaire: {response.status_code} - {response.text}")
        
        # Récupérer les commentaires
        response = requests.get(f"{API_BASE}/media/files/{media_id}/comments/", headers=headers)
        if response.status_code == 200:
            comments = response.json()
            print(f"   Nombre de commentaires: {len(comments)}")
            for comment in comments:
                print(f"   - {comment.get('user_name', 'N/A')}: {comment.get('content', 'N/A')}")
    except Exception as e:
        print(f"❌ Erreur commentaires: {e}")
    
    # 7. Tester le téléchargement
    print("\n7. Test du téléchargement...")
    try:
        response = requests.get(f"{API_BASE}/media/files/{media_id}/download/", headers=headers)
        if response.status_code == 200:
            print("✅ Téléchargement réussi")
            print(f"   Taille du fichier téléchargé: {len(response.content)} bytes")
        else:
            print(f"❌ Erreur téléchargement: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur téléchargement: {e}")
    
    # 8. Récupérer les statistiques
    print("\n8. Test des statistiques...")
    try:
        response = requests.get(f"{API_BASE}/media/stats/", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print("✅ Statistiques récupérées:")
            print(f"   Total fichiers: {stats['global']['total_files']}")
            print(f"   Taille totale: {stats['global']['total_size_human']}")
            print(f"   Fichiers utilisateur: {stats['user']['files_count']}")
        else:
            print(f"❌ Erreur statistiques: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur statistiques: {e}")
    
    # 9. Nettoyage
    print("\n9. Nettoyage...")
    try:
        # Supprimer le fichier de test
        response = requests.delete(f"{API_BASE}/media/files/{media_id}/", headers=headers)
        if response.status_code == 204:
            print("✅ Fichier de test supprimé")
        else:
            print(f"❌ Erreur suppression: {response.status_code} - {response.text}")
        
        # Supprimer le fichier local
        if test_file_path.exists():
            test_file_path.unlink()
            print("✅ Fichier local supprimé")
    except Exception as e:
        print(f"❌ Erreur nettoyage: {e}")
    
    print("\n🎉 Test de la galerie média terminé !")
    print("=" * 50)

if __name__ == "__main__":
    test_media_gallery()
