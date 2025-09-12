#!/usr/bin/env python3
"""
Script pour tester l'envoi de données GPS depuis un tracker
"""
import requests
import json
import time
import random
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api"
TRACKER_ENDPOINT = f"{API_BASE_URL}/tracking/webhook/tracker/"

def simulate_gps_tracker(device_id, num_positions=10, interval=5):
    """
    Simuler un tracker GPS qui envoie des données
    """
    print(f"🚀 Simulation du tracker GPS: {device_id}")
    print(f"📡 Envoi de {num_positions} positions toutes les {interval} secondes")
    
    # Coordonnées de départ (Cayar, Sénégal)
    start_lat = 14.7167
    start_lon = -17.4677
    
    for i in range(num_positions):
        # Simuler un mouvement aléatoire
        lat_offset = random.uniform(-0.01, 0.01)  # ~1km de variation
        lon_offset = random.uniform(-0.01, 0.01)
        
        current_lat = start_lat + lat_offset
        current_lon = start_lon + lon_offset
        
        # Données GPS simulées
        gps_data = {
            "device_id": device_id,
            "imei": f"1234567890{device_id}",
            "latitude": current_lat,
            "longitude": current_lon,
            "speed": random.uniform(0, 15),  # 0-15 km/h
            "heading": random.randint(0, 360),
            "altitude": random.uniform(0, 10),
            "accuracy": random.uniform(5, 20),
            "battery_level": random.randint(20, 100),
            "signal_strength": random.randint(1, 5),
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            print(f"📤 Envoi position {i+1}/{num_positions}: {current_lat:.6f}, {current_lon:.6f}")
            
            response = requests.post(
                TRACKER_ENDPOINT,
                json=gps_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Position enregistrée: {result.get('message', 'OK')}")
            else:
                print(f"❌ Erreur {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
        
        # Attendre avant la prochaine position
        if i < num_positions - 1:
            time.sleep(interval)
    
    print(f"🏁 Simulation terminée pour le tracker {device_id}")

def test_multiple_trackers():
    """
    Tester plusieurs trackers simultanément
    """
    trackers = [
        {"device_id": "TRK001", "positions": 5, "interval": 3},
        {"device_id": "TRK002", "positions": 5, "interval": 4},
        {"device_id": "TRK003", "positions": 5, "interval": 5},
    ]
    
    print("🚀 Test de plusieurs trackers GPS")
    
    for tracker in trackers:
        simulate_gps_tracker(
            tracker["device_id"],
            tracker["positions"],
            tracker["interval"]
        )
        print(f"⏳ Attente avant le prochain tracker...")
        time.sleep(2)

def test_live_positions():
    """
    Tester la récupération des positions en temps réel
    """
    print("📡 Test de récupération des positions en temps réel")
    
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
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")

def test_device_status(device_id):
    """
    Tester la récupération du statut d'un dispositif
    """
    print(f"📊 Test du statut du dispositif {device_id}")
    
    try:
        response = requests.get(f"{API_BASE_URL}/tracking/devices/{device_id}/status/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statut du dispositif {device_id}:")
            print(f"  🔋 Batterie: {data.get('battery_level', 'N/A')}%")
            print(f"  📶 Signal: {data.get('signal_strength', 'N/A')}/5")
            print(f"  🕐 Dernière communication: {data.get('last_communication', 'N/A')}")
            
            if data.get('last_position'):
                pos = data['last_position']
                print(f"  📍 Dernière position: {pos['latitude']:.6f}, {pos['longitude']:.6f}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")

if __name__ == '__main__':
    print("🧪 Test du système de tracking GPS")
    print("=" * 50)
    
    # Test 1: Un seul tracker
    print("\n1️⃣ Test d'un tracker GPS")
    simulate_gps_tracker("TRK001", num_positions=3, interval=2)
    
    # Test 2: Récupération des positions
    print("\n2️⃣ Test de récupération des positions")
    test_live_positions()
    
    # Test 3: Statut d'un dispositif
    print("\n3️⃣ Test du statut d'un dispositif")
    test_device_status("TRK001")
    
    # Test 4: Plusieurs trackers
    print("\n4️⃣ Test de plusieurs trackers")
    test_multiple_trackers()
    
    # Test final: Vérification finale
    print("\n5️⃣ Vérification finale des positions")
    test_live_positions()
    
    print("\n🎉 Tests terminés!")
    print("\n📋 URLs utiles:")
    print(f"  📡 Webhook tracker: {TRACKER_ENDPOINT}")
    print(f"  📍 Positions en temps réel: {API_BASE_URL}/tracking/live-positions/")
    print(f"  📊 Statut dispositif: {API_BASE_URL}/tracking/devices/TRK001/status/")

