#!/usr/bin/env python3
"""
Script de test complet pour le système GPS
"""
import requests
import json
import time
import random
from datetime import datetime, timedelta

# Configuration
API_BASE_URL = "http://localhost:8000/api"
TRACKER_ENDPOINT = f"{API_BASE_URL}/tracking/webhook/tracker/"

def test_gps_endpoint():
    """Tester l'endpoint de réception GPS"""
    print("🧪 Test de l'endpoint GPS")
    
    # Données de test
    test_data = {
        "device_id": "TEST001",
        "imei": "123456789012345",
        "latitude": 14.7167,
        "longitude": -17.4677,
        "speed": 5.5,
        "heading": 180,
        "altitude": 2.0,
        "accuracy": 8.5,
        "battery_level": 85,
        "signal_strength": 4,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            TRACKER_ENDPOINT,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Endpoint GPS fonctionne")
            return True
        else:
            print("❌ Erreur endpoint GPS")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def simulate_tracker_movement(device_id, start_lat, start_lon, num_positions=10):
    """Simuler le mouvement d'un tracker"""
    print(f"🚀 Simulation du tracker {device_id}")
    
    current_lat = start_lat
    current_lon = start_lon
    
    for i in range(num_positions):
        # Mouvement aléatoire
        lat_offset = random.uniform(-0.005, 0.005)
        lon_offset = random.uniform(-0.005, 0.005)
        
        current_lat += lat_offset
        current_lon += lon_offset
        
        gps_data = {
            "device_id": device_id,
            "imei": f"1234567890{device_id}",
            "latitude": current_lat,
            "longitude": current_lon,
            "speed": random.uniform(0, 12),
            "heading": random.randint(0, 360),
            "altitude": random.uniform(0, 5),
            "accuracy": random.uniform(3, 15),
            "battery_level": max(10, 100 - (i * 5)),
            "signal_strength": random.randint(1, 5),
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(
                TRACKER_ENDPOINT,
                json=gps_data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Position {i+1}: {current_lat:.6f}, {current_lon:.6f}")
            else:
                print(f"❌ Erreur position {i+1}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erreur position {i+1}: {e}")
        
        time.sleep(2)  # Attendre 2 secondes entre chaque position

def test_live_positions():
    """Tester la récupération des positions en temps réel"""
    print("\n📡 Test des positions en temps réel")
    
    try:
        response = requests.get(f"{API_BASE_URL}/tracking/live-positions/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['metadata']['total_positions']} positions récupérées")
            
            for feature in data['features']:
                props = feature['properties']
                coords = feature['geometry']['coordinates']
                print(f"  📍 {props['full_name']} ({props['device_id']}): {coords[1]:.6f}, {coords[0]:.6f}")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_device_status(device_id):
    """Tester le statut d'un dispositif"""
    print(f"\n📊 Test du statut du dispositif {device_id}")
    
    try:
        response = requests.get(f"{API_BASE_URL}/tracking/devices/{device_id}/status/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statut du dispositif {device_id}:")
            print(f"  🔋 Batterie: {data.get('battery_level', 'N/A')}%")
            print(f"  📶 Signal: {data.get('signal_strength', 'N/A')}/5")
            print(f"  🕐 Dernière communication: {data.get('last_communication', 'N/A')}")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Test principal"""
    print("🧪 Test complet du système GPS")
    print("=" * 50)
    
    # Test 1: Endpoint de base
    print("\n1️⃣ Test de l'endpoint GPS")
    if not test_gps_endpoint():
        print("❌ Test échoué, arrêt des tests")
        return
    
    # Test 2: Simulation de mouvement
    print("\n2️⃣ Simulation de mouvement des trackers")
    trackers = [
        {"id": "TRK001", "lat": 14.7167, "lon": -17.4677},
        {"id": "TRK002", "lat": 14.7200, "lon": -17.4600},
        {"id": "TRK003", "lat": 14.7100, "lon": -17.4700},
    ]
    
    for tracker in trackers:
        simulate_tracker_movement(tracker["id"], tracker["lat"], tracker["lon"], 5)
        time.sleep(1)
    
    # Test 3: Récupération des positions
    print("\n3️⃣ Test de récupération des positions")
    test_live_positions()
    
    # Test 4: Statut des dispositifs
    print("\n4️⃣ Test du statut des dispositifs")
    for tracker in trackers:
        test_device_status(tracker["id"])
    
    print("\n🎉 Tests terminés!")
    print("\n📋 URLs utiles:")
    print(f"  📡 Webhook tracker: {TRACKER_ENDPOINT}")
    print(f"  📍 Positions en temps réel: {API_BASE_URL}/tracking/live-positions/")
    print(f"  📊 Statut dispositif: {API_BASE_URL}/tracking/devices/TRK001/status/")

if __name__ == '__main__':
    main()

