#!/usr/bin/env python3
"""
Script de test pour les balises et zones
Teste la création, stockage et récupération des coordonnées GPS
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_balises_zones():
    """Test complet des balises et zones"""
    
    print("🧪 Test des balises et zones avec coordonnées GPS")
    print("=" * 60)
    
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
    
    # 2. Créer une balise
    print("\n2. Création d'une balise...")
    balise_data = {
        "name": "Balise Test GPS",
        "balise_type": "gps",
        "latitude": 14.6928,
        "longitude": -17.4467,
        "vessel_name": "Pirogue Test",
        "frequency": "121.5",
        "power": "5W",
        "notes": "Balise de test pour vérifier le stockage GPS"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/tracking/balises/",
            json=balise_data,
            headers=headers
        )
        
        if response.status_code == 201:
            balise = response.json()
            print(f"✅ Réponse création balise: {json.dumps(balise, indent=2)}")
            balise_id = balise['id']
            print(f"✅ Balise créée avec succès - ID: {balise_id}")
            print(f"   Nom: {balise.get('name', 'N/A')}")
            print(f"   Type: {balise.get('balise_type', 'N/A')}")
            print(f"   Coordonnées: {balise.get('latitude', 'N/A')}, {balise.get('longitude', 'N/A')}")
            print(f"   Créée par: {balise.get('created_by', 'N/A')}")
        else:
            print(f"❌ Erreur création balise: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Erreur création balise: {e}")
        return
    
    # 3. Créer une zone
    print("\n3. Création d'une zone...")
    zone_data = {
        "name": "Zone de Pêche Test",
        "description": "Zone de test pour vérifier le stockage des coordonnées GPS",
        "zone_type": "fishing",
        "zone_shape": "circle",
        "center_latitude": 14.6928,
        "center_longitude": -17.4467,
        "coordinates": {
            "type": "Polygon",
            "coordinates": [[
                [-17.4467, 14.6928],
                [-17.4367, 14.6928],
                [-17.4367, 14.7028],
                [-17.4467, 14.7028],
                [-17.4467, 14.6928]
            ]]
        },
        "radius": 1000,
        "area": 3141592.65,
        "is_active": True,
        "is_restricted": False,
        "max_speed": 5.0,
        "color": "#3B82F6",
        "opacity": 0.3,
        "stroke_color": "#1E40AF",
        "stroke_width": 2
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/zones/",
            json=zone_data,
            headers=headers
        )
        
        if response.status_code == 201:
            zone = response.json()
            zone_id = zone['id']
            print(f"✅ Zone créée avec succès - ID: {zone_id}")
            print(f"   Nom: {zone['name']}")
            print(f"   Type: {zone['zone_type']}")
            print(f"   Centre: {zone['center_latitude']}, {zone['center_longitude']}")
            print(f"   Forme: {zone['zone_shape']}")
            print(f"   Rayon: {zone['radius']}m")
            print(f"   Créée par: {zone['created_by']}")
        else:
            print(f"❌ Erreur création zone: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Erreur création zone: {e}")
        return
    
    # 4. Récupérer la liste des balises
    print("\n4. Récupération de la liste des balises...")
    try:
        response = requests.get(f"{API_BASE}/tracking/balises/", headers=headers)
        if response.status_code == 200:
            balises = response.json()
            balises_list = balises.get('results', balises)
            print(f"✅ {len(balises_list)} balise(s) trouvée(s)")
            
            for balise in balises_list:
                print(f"   - {balise['name']} ({balise['balise_type']}) - {balise['latitude']}, {balise['longitude']}")
        else:
            print(f"❌ Erreur récupération balises: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur récupération balises: {e}")
    
    # 5. Récupérer la liste des zones
    print("\n5. Récupération de la liste des zones...")
    try:
        response = requests.get(f"{API_BASE}/zones/", headers=headers)
        if response.status_code == 200:
            zones = response.json()
            zones_list = zones.get('results', zones)
            print(f"✅ {len(zones_list)} zone(s) trouvée(s)")
            
            for zone in zones_list:
                print(f"   - {zone['name']} ({zone['zone_type']}) - Centre: {zone['center_latitude']}, {zone['center_longitude']}")
        else:
            print(f"❌ Erreur récupération zones: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur récupération zones: {e}")
    
    # 6. Récupérer les balises en format GeoJSON
    print("\n6. Récupération des balises en format GeoJSON...")
    try:
        response = requests.get(f"{API_BASE}/tracking/balises/geojson/", headers=headers)
        if response.status_code == 200:
            geojson = response.json()
            features = geojson.get('features', [])
            print(f"✅ {len(features)} balise(s) en format GeoJSON")
            
            for feature in features:
                props = feature['properties']
                coords = feature['geometry']['coordinates']
                print(f"   - {props['name']}: [{coords[0]}, {coords[1]}]")
        else:
            print(f"❌ Erreur GeoJSON balises: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur GeoJSON balises: {e}")
    
    # 7. Récupérer les zones en format GeoJSON
    print("\n7. Récupération des zones en format GeoJSON...")
    try:
        response = requests.get(f"{API_BASE}/zones/geojson/", headers=headers)
        if response.status_code == 200:
            geojson = response.json()
            features = geojson.get('features', [])
            print(f"✅ {len(features)} zone(s) en format GeoJSON")
            
            for feature in features:
                props = feature['properties']
                geom = feature['geometry']
                print(f"   - {props['name']}: {geom['type']} avec {len(geom['coordinates'])} coordonnées")
        else:
            print(f"❌ Erreur GeoJSON zones: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur GeoJSON zones: {e}")
    
    # 8. Récupérer les détails d'une balise
    print("\n8. Récupération des détails de la balise...")
    try:
        response = requests.get(f"{API_BASE}/tracking/balises/{balise_id}/", headers=headers)
        if response.status_code == 200:
            balise_detail = response.json()
            print("✅ Détails de la balise:")
            print(f"   ID: {balise_detail['id']}")
            print(f"   Nom: {balise_detail['name']}")
            print(f"   Type: {balise_detail['balise_type']}")
            print(f"   Statut: {balise_detail['status']}")
            print(f"   Coordonnées: {balise_detail['latitude']}, {balise_detail['longitude']}")
            print(f"   Vaisseau: {balise_detail['vessel_name']}")
            print(f"   Fréquence: {balise_detail['frequency']}")
            print(f"   Puissance: {balise_detail['power']}")
            print(f"   Créée par: {balise_detail['created_by_name']}")
            print(f"   Créée le: {balise_detail['created_at']}")
        else:
            print(f"❌ Erreur détails balise: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur détails balise: {e}")
    
    # 9. Récupérer les détails d'une zone
    print("\n9. Récupération des détails de la zone...")
    try:
        response = requests.get(f"{API_BASE}/zones/{zone_id}/", headers=headers)
        if response.status_code == 200:
            zone_detail = response.json()
            print("✅ Détails de la zone:")
            print(f"   ID: {zone_detail['id']}")
            print(f"   Nom: {zone_detail['name']}")
            print(f"   Type: {zone_detail['zone_type']}")
            print(f"   Forme: {zone_detail['zone_shape']}")
            print(f"   Centre: {zone_detail['center_latitude']}, {zone_detail['center_longitude']}")
            print(f"   Rayon: {zone_detail['radius']}m")
            print(f"   Superficie: {zone_detail['area']}m²")
            print(f"   Active: {zone_detail['is_active']}")
            print(f"   Restreinte: {zone_detail['is_restricted']}")
            print(f"   Vitesse max: {zone_detail['max_speed']} nœuds")
            print(f"   Créée par: {zone_detail['created_by_name']}")
            print(f"   Créée le: {zone_detail['created_at']}")
        else:
            print(f"❌ Erreur détails zone: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur détails zone: {e}")
    
    # 10. Nettoyage
    print("\n10. Nettoyage...")
    try:
        # Supprimer la balise de test
        response = requests.delete(f"{API_BASE}/tracking/balises/{balise_id}/", headers=headers)
        if response.status_code == 204:
            print("✅ Balise de test supprimée")
        else:
            print(f"❌ Erreur suppression balise: {response.status_code} - {response.text}")
        
        # Supprimer la zone de test
        response = requests.delete(f"{API_BASE}/zones/{zone_id}/", headers=headers)
        if response.status_code == 204:
            print("✅ Zone de test supprimée")
        else:
            print(f"❌ Erreur suppression zone: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erreur nettoyage: {e}")
    
    print("\n🎉 Test des balises et zones terminé !")
    print("=" * 60)

if __name__ == "__main__":
    test_balises_zones()
