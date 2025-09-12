#!/usr/bin/env python3
"""
Script de test pour vérifier l'intégration Totarget GPS Platform
Basé sur le guide d'intégration fourni
"""

import requests
import json
import time
from datetime import datetime

# Configuration de test
TOTARGET_API_URL = "https://api.totarget.net:8108/api/send-command"
TOTARGET_API_TOKEN = "VB25taGElVs7SrFySdv14Or8IsZdO261QF5sxw8tW4IdVeWPFOhffA=="
TEST_DEVICE_ID = "000019246001"  # Dispositif de test selon le guide

def test_totarget_authentication():
    """Test d'authentification avec l'API Totarget"""
    print("🔐 Test d'authentification Totarget...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Test avec un payload minimal
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "SingleReportLocation"
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Authentification réussie")
            return True
        elif response.status_code == 401:
            print("❌ Erreur d'authentification - Token invalide")
            return False
        else:
            print(f"⚠️ Réponse inattendue: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_seal_command():
    """Test de commande de scellement selon le guide"""
    print("\n🔒 Test de commande SEAL...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Commande SEAL selon le guide
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "Elock",
                "elockCommand": {
                    "cmdType": "SEAL",
                    "lockId": "19246001",
                    "bill": "1908060640196081",
                    "lineCode": 1234,
                    "gate": 8,
                    "key": "13970",
                    "validTime": 0,
                    "businessDataSeqNo": "712E"
                }
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Commande SEAL envoyée")
            print(f"Résultat: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Erreur commande SEAL: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_unseal_command():
    """Test de commande de descellement selon le guide"""
    print("\n🔓 Test de commande UNSEAL...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Commande UNSEAL selon le guide
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "Elock",
                "elockCommand": {
                    "cmdType": "UNSEAL",
                    "lockId": "19246001",
                    "bill": "1908060640196082",
                    "lineCode": 1234,
                    "gate": 8,
                    "key": "13970",
                    "validTime": 0,
                    "businessDataSeqNo": "712F"
                }
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Commande UNSEAL envoyée")
            print(f"Résultat: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Erreur commande UNSEAL: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_parameter_settings():
    """Test des paramètres de configuration selon le guide"""
    print("\n⚙️ Test des paramètres de configuration...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Test configuration intervalle de heartbeat
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "ParameterSettings",
                "paramSettingList": [{
                    "commandId": "00000001",
                    "heartbeatInterval": 600  # 10 minutes
                }]
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Paramètres de configuration envoyés")
            print(f"Résultat: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Erreur configuration: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_device_commands():
    """Test des commandes de dispositif selon le guide"""
    print("\n📱 Test des commandes de dispositif...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Test redémarrage du dispositif
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "RebootDevice"
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Commande de redémarrage envoyée")
            print(f"Résultat: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Erreur commande dispositif: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_webhook_simulation():
    """Simulation d'un webhook Totarget selon le guide"""
    print("\n🌐 Simulation webhook Totarget...")
    
    # Payload selon le guide Totarget
    webhook_payload = {
        "000019246001": [
            {
                "responseType": "Location Data Upload",
                "deviceId": "000019246001",
                "msgSeqNo": "0002",
                "gpsLocation": {
                    "alarm": "Device Main Power Undervoltage",
                    "status": "Standby,Precise Positioning,East Longitude,North Latitude",
                    "isPrecise": True,
                    "lat": "50.787776",
                    "lon": "0.258606",
                    "altitude": 4097,
                    "speed": 0,
                    "direction": 320,
                    "gpsTime": "2019-08-06T06:40:19.000Z",
                    "recvTime": "2019-08-06T06:40:20.193Z"
                },
                "extraInfoDescArr": [
                    "Odometer: 0 KM",
                    "Wireless Network Signal Strength: 7",
                    "LBS Info: Country Code - GB, Network identification - 20, Station LAC - 5144, Station CELL - 929544, Signal strength - 17",
                    "Device Power: 20%",
                    "24 Alarm Status: Lock Rope Cut Alarm,Tilt Alarm",
                    "24 Switch Status: Network Type - 4G,Vibration,Motor Released"
                ]
            }
        ]
    }
    
    # Headers selon le guide
    headers = {
        'Content-Type': 'application/json',
        'data-source-id': 'TGP',
        'data-type': 'HDR'
    }
    
    # URL du webhook local
    webhook_url = "http://localhost:8000/api/tracking/webhook/totarget/"
    
    try:
        response = requests.post(
            webhook_url,
            headers=headers,
            json=webhook_payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook simulé avec succès")
            return True
        else:
            print(f"❌ Erreur webhook: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion webhook: {str(e)}")
        print("⚠️ Assurez-vous que le serveur Django est en cours d'exécution")
        return False

def test_invalid_authentication():
    """Test avec un token invalide"""
    print("\n🚫 Test avec token invalide...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'INVALID_TOKEN'
    }
    
    payload = {
        "cacheCommandsWhenOffline": False,
        "commands": {
            TEST_DEVICE_ID: [{
                "type": "SingleReportLocation"
            }]
        }
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Test d'authentification invalide réussi")
            return True
        else:
            print(f"⚠️ Réponse inattendue: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_invalid_payload():
    """Test avec un payload invalide"""
    print("\n📝 Test avec payload invalide...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': TOTARGET_API_TOKEN
    }
    
    # Payload invalide
    payload = {
        "invalid_key": "invalid_value"
    }
    
    try:
        response = requests.post(
            TOTARGET_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            print("✅ Test de payload invalide réussi")
            return True
        else:
            print(f"⚠️ Réponse inattendue: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Test d'intégration Totarget GPS Platform")
    print("=" * 50)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API URL: {TOTARGET_API_URL}")
    print(f"Device ID: {TEST_DEVICE_ID}")
    print("=" * 50)
    
    tests = [
        ("Authentification", test_totarget_authentication),
        ("Commande SEAL", test_seal_command),
        ("Commande UNSEAL", test_unseal_command),
        ("Paramètres", test_parameter_settings),
        ("Commandes dispositif", test_device_commands),
        ("Webhook simulation", test_webhook_simulation),
        ("Token invalide", test_invalid_authentication),
        ("Payload invalide", test_invalid_payload)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur lors du test {test_name}: {str(e)}")
            results.append((test_name, False))
        
        time.sleep(1)  # Pause entre les tests
    
    # Résumé des résultats
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print("=" * 50)
    print(f"Tests réussis: {passed}/{total}")
    print(f"Taux de réussite: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 Tous les tests sont passés avec succès!")
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez la configuration.")

if __name__ == "__main__":
    main()
