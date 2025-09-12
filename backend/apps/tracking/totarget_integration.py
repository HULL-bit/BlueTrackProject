import requests
import json
import logging
import hashlib
import time
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Location, TrackerDevice
from apps.users.models import User

logger = logging.getLogger(__name__)

# Configuration Totarget API
TOTARGET_API_URL = getattr(settings, 'TOTARGET_API_URL', 'https://api.totarget.net:8108/api/send-command')
TOTARGET_API_TOKEN = getattr(settings, 'TOTARGET_API_TOKEN', 'MJoNQoDJZuCROZZoaPHzzlxn4s5PPWFXF2Tjl3aC3htvi7geQLGz9A==')
TOTARGET_WEBHOOK_URL = getattr(settings, 'TOTARGET_WEBHOOK_URL', 'https://c99fc6123332.ngrok-free.app/api/tracking/webhook/totarget/')

class TotargetGPSIntegration:
    """Classe pour gérer l'intégration avec l'API Totarget GPS"""
    
    def __init__(self):
        self.api_url = TOTARGET_API_URL
        self.api_token = TOTARGET_API_TOKEN
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': self.api_token
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def _validate_device_id(self, device_id: str) -> bool:
        """Valider le format de l'ID du dispositif"""
        if not device_id or len(device_id) != 12:
            return False
        return device_id.isdigit()

    def _validate_command(self, command: dict) -> bool:
        """Valider la structure de la commande"""
        required_fields = ['type']
        if not all(field in command for field in required_fields):
            return False
        
        # Validation spécifique pour les commandes ELock
        if command.get('type') == 'Elock':
            elock_command = command.get('elockCommand', {})
            required_elock_fields = ['cmdType', 'lockId', 'bill', 'lineCode', 'gate', 'key']
            if not all(field in elock_command for field in required_elock_fields):
                return False
        
        return True

    def _generate_bill_number(self) -> str:
        """Générer un numéro de facture unique basé sur le timestamp"""
        timestamp = int(timezone.now().timestamp() * 1000)
        return f"{timestamp}"

    def _generate_seq_no(self) -> str:
        """Générer un numéro de séquence pour les commandes"""
        import random
        return ''.join(random.choices('0123456789ABCDEF', k=4))

    def send_command(self, device_id: str, command: dict, cache_offline: bool = False):
        """Envoyer une commande à un dispositif GPS"""
        # Validation des paramètres
        if not self._validate_device_id(device_id):
            raise ValueError(f"ID de dispositif invalide: {device_id}")
        
        if not self._validate_command(command):
            raise ValueError("Structure de commande invalide")
        
        payload = {
            "cacheCommandsWhenOffline": cache_offline,
            "commands": {
                device_id: [command]
            }
        }
        
        try:
            logger.info(f"Envoi commande Totarget: {device_id} - {command.get('type')}")
            
            response = self.session.post(
                self.api_url,
                json=payload,
                timeout=30
            )
            
            logger.info(f"Réponse Totarget: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Commande envoyée avec succès: {result}")
                return result
            elif response.status_code == 401:
                error_msg = "Token d'authentification invalide"
                logger.error(f"Erreur d'authentification Totarget: {response.text}")
                raise Exception(error_msg)
            elif response.status_code == 400:
                error_msg = f"Requête invalide: {response.text}"
                logger.error(f"Erreur de requête Totarget: {response.text}")
                raise Exception(error_msg)
            elif response.status_code == 403:
                error_msg = "Dispositif non autorisé"
                logger.error(f"Erreur d'autorisation Totarget: {response.text}")
                raise Exception(error_msg)
            else:
                error_msg = f"Erreur API Totarget: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            error_msg = "Timeout de la requête Totarget"
            logger.error(error_msg)
            raise Exception(error_msg)
        except requests.exceptions.ConnectionError:
            error_msg = "Erreur de connexion à l'API Totarget"
            logger.error(error_msg)
            raise Exception(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"Erreur réseau Totarget: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
        except json.JSONDecodeError:
            error_msg = "Réponse JSON invalide de Totarget"
            logger.error(error_msg)
            raise Exception(error_msg)

    def request_location(self, device_id: str):
        """Demander la position actuelle d'un dispositif"""
        command = {"type": "SingleReportLocation"}
        return self.send_command(device_id, command)

    def set_location_interval(self, device_id: str, interval_seconds: int):
        """Configurer l'intervalle de rapport de position"""
        if interval_seconds < 10 or interval_seconds > 3600:
            raise ValueError("Intervalle doit être entre 10 et 3600 secondes")
        
        command = {
            "type": "ReportLocation",
            "interval": interval_seconds
        }
        return self.send_command(device_id, command)

    def seal_device(self, device_id: str, lock_id: str, key: str, gate: int = 8):
        """Sceller un dispositif ELock"""
        if len(key) != 6 or not key.isdigit():
            raise ValueError("La clé doit être un nombre à 6 chiffres")
        
        if gate < 1 or gate > 255:
            raise ValueError("Gate doit être entre 1 et 255")
        
        command = {
            "type": "Elock",
            "elockCommand": {
                "cmdType": "SEAL",
                "lockId": lock_id,
                "bill": self._generate_bill_number(),
                "lineCode": 1234,
                "gate": gate,
                "key": key,
                "validTime": 0,
                "businessDataSeqNo": self._generate_seq_no()
            }
        }
        return self.send_command(device_id, command)

    def unseal_device(self, device_id: str, lock_id: str, key: str, gate: int = 8):
        """Desceller un dispositif ELock"""
        if len(key) != 6 or not key.isdigit():
            raise ValueError("La clé doit être un nombre à 6 chiffres")
        
        if gate < 1 or gate > 255:
            raise ValueError("Gate doit être entre 1 et 255")
        
        command = {
            "type": "Elock",
            "elockCommand": {
                "cmdType": "UNSEAL",
                "lockId": lock_id,
                "bill": self._generate_bill_number(),
                "lineCode": 1234,
                "gate": gate,
                "key": key,
                "validTime": 0,
                "businessDataSeqNo": self._generate_seq_no()
            }
        }
        return self.send_command(device_id, command)

    def cancel_alarm(self, device_id: str, lock_id: str, key: str, gate: int = 8):
        """Annuler une alerte ELock"""
        if len(key) != 6 or not key.isdigit():
            raise ValueError("La clé doit être un nombre à 6 chiffres")
        
        command = {
            "type": "Elock",
            "elockCommand": {
                "cmdType": "CANCEL_ALARM",
                "lockId": lock_id,
                "bill": self._generate_bill_number(),
                "lineCode": 1234,
                "gate": gate,
                "key": key,
                "validTime": 0,
                "businessDataSeqNo": self._generate_seq_no()
            }
        }
        return self.send_command(device_id, command)

    def reboot_device(self, device_id: str):
        """Redémarrer un dispositif"""
        command = {"type": "RebootDevice"}
        return self.send_command(device_id, command)

    def factory_reset(self, device_id: str):
        """Réinitialiser un dispositif aux paramètres d'usine"""
        command = {"type": "ResetFactorySettings"}
        return self.send_command(device_id, command)

    def set_heartbeat_interval(self, device_id: str, interval_seconds: int):
        """Configurer l'intervalle de heartbeat"""
        if interval_seconds < 60 or interval_seconds > 3600:
            raise ValueError("Intervalle heartbeat doit être entre 60 et 3600 secondes")
        
        command = {
            "type": "ParameterSettings",
            "paramSettingList": [{
                "commandId": "00000001",
                "heartbeatInterval": interval_seconds
            }]
        }
        return self.send_command(device_id, command)

    def set_alarm_location_interval(self, device_id: str, interval_seconds: int):
        """Configurer l'intervalle de position en mode alerte"""
        if interval_seconds < 10 or interval_seconds > 300:
            raise ValueError("Intervalle alerte doit être entre 10 et 300 secondes")
        
        command = {
            "type": "ParameterSettings",
            "paramSettingList": [{
                "commandId": "00000028",
                "inAlarmLocationUploadInterval": interval_seconds
            }]
        }
        return self.send_command(device_id, command)

    def set_sleep_location_interval(self, device_id: str, interval_seconds: int):
        """Configurer l'intervalle de position en mode sommeil"""
        if interval_seconds < 30 or interval_seconds > 3600:
            raise ValueError("Intervalle sommeil doit être entre 30 et 3600 secondes")
        
        command = {
            "type": "ParameterSettings",
            "paramSettingList": [{
                "commandId": "00000027",
                "sleepingLocationUploadInterval": interval_seconds
            }]
        }
        return self.send_command(device_id, command)

    def enable_sleep_mode(self, device_id: str):
        """Activer le mode sommeil"""
        command = {"type": "EnableSleepMode"}
        return self.send_command(device_id, command)

    def device_power_off(self, device_id: str):
        """Éteindre le dispositif"""
        command = {"type": "DevicePowerOff"}
        return self.send_command(device_id, command)

# Instance globale
totarget_integration = TotargetGPSIntegration()

@csrf_exempt
@require_http_methods(["POST"])
def totarget_webhook(request):
    """
    Webhook pour recevoir les données des dispositifs Totarget GPS
    """
    try:
        # Vérifier les headers de sécurité
        data_source = request.META.get('HTTP_DATA_SOURCE_ID')
        data_type = request.META.get('HTTP_DATA_TYPE')
        
        logger.info(f"Webhook Totarget reçu - Source: {data_source}, Type: {data_type}")
        
        if data_source != 'TGP' or data_type != 'HDR':
            logger.warning(f"Headers invalides: source={data_source}, type={data_type}")
            return JsonResponse({'error': 'Headers invalides'}, status=400)

        # Parser les données JSON
        try:
            payload = json.loads(request.body)
            logger.info(f"Payload reçu: {len(payload)} dispositifs")
        except json.JSONDecodeError as e:
            logger.error(f"Payload JSON invalide: {str(e)}")
            return JsonResponse({'error': 'JSON invalide'}, status=400)

        # Traiter chaque dispositif dans le payload
        processed_devices = []
        errors = []
        
        for device_id, device_responses in payload.items():
            try:
                # Valider l'ID du dispositif
                if not totarget_integration._validate_device_id(device_id):
                    logger.warning(f"ID de dispositif invalide: {device_id}")
                    continue
                
                # Chercher le dispositif dans la base de données
                try:
                    device = TrackerDevice.objects.get(device_id=device_id, is_active=True)
                except TrackerDevice.DoesNotExist:
                    logger.warning(f"Dispositif non trouvé: {device_id}")
                    continue
                
                # Traiter chaque réponse du dispositif
                for response_data in device_responses:
                    try:
                        processed = process_device_response(device, response_data)
                        if processed:
                            processed_devices.append(device_id)
                    except Exception as e:
                        error_msg = f"Erreur traitement réponse {device_id}: {str(e)}"
                        logger.error(error_msg)
                        errors.append(error_msg)
                        
            except Exception as e:
                error_msg = f"Erreur traitement dispositif {device_id}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                continue

        logger.info(f"Webhook Totarget traité: {len(processed_devices)} dispositifs, {len(errors)} erreurs")
        
        response_data = {
            'status': 'success',
            'processed_devices': processed_devices,
            'message': f'{len(processed_devices)} dispositifs traités'
        }
        
        if errors:
            response_data['errors'] = errors
        
        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Erreur webhook Totarget: {str(e)}")
        return JsonResponse({'error': 'Erreur serveur'}, status=500)

def process_device_response(device: TrackerDevice, response_data: dict):
    """Traiter une réponse de dispositif GPS"""
    try:
        response_type = response_data.get('responseType')
        gps_location = response_data.get('gpsLocation')
        
        logger.info(f"Traitement réponse {device.device_id}: {response_type}")
        
        if not gps_location:
            logger.warning(f"Pas de données GPS pour {device.device_id}")
            return False

        # Valider les coordonnées GPS
        try:
            lat = float(gps_location['lat'])
            lon = float(gps_location['lon'])
            
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                logger.warning(f"Coordonnées GPS invalides: {lat}, {lon}")
                return False
        except (ValueError, KeyError) as e:
            logger.error(f"Erreur parsing coordonnées GPS: {str(e)}")
            return False

        # Créer ou mettre à jour la position
        location_data = {
            'user': device.user,
            'latitude': lat,
            'longitude': lon,
            'altitude': gps_location.get('altitude', 0),
            'speed': gps_location.get('speed', 0),
            'heading': gps_location.get('direction', 0),
            'accuracy': 10,  # Valeur par défaut
            'timestamp': timezone.now()
        }
        
        location = Location.objects.create(**location_data)
        
        # Mettre à jour les informations du dispositif
        device.last_communication = timezone.now()
        device.is_active = True
        
        # Extraire les informations supplémentaires
        extra_info = response_data.get('extraInfoDescArr', [])
        for info in extra_info:
            try:
                if 'Device Power:' in info:
                    battery_str = info.split('Device Power:')[1].strip()
                    battery_level = int(battery_str.replace('%', ''))
                    if 0 <= battery_level <= 100:
                        device.battery_level = battery_level
                elif 'Signal strength' in info:
                    signal_str = info.split('Signal strength -')[1].strip()
                    signal_strength = int(signal_str)
                    if 0 <= signal_strength <= 5:
                        device.signal_strength = signal_strength
            except (ValueError, IndexError) as e:
                logger.warning(f"Erreur parsing info supplémentaire: {str(e)}")
                continue
        
        device.save()
        
        # Mettre à jour l'utilisateur
        device.user.last_location_update = timezone.now()
        device.user.is_active_session = True
        device.user.save()
        
        # Traiter les réponses ELock si présentes
        elock_response = response_data.get('elockResponse')
        if elock_response:
            process_elock_response(device, elock_response)
        
        logger.info(f"Position mise à jour pour dispositif {device.device_id}")
        return True
        
    except Exception as e:
        logger.error(f"Erreur traitement réponse dispositif: {str(e)}")
        return False

def process_elock_response(device: TrackerDevice, elock_response: dict):
    """Traiter une réponse ELock"""
    try:
        cmd_type = elock_response.get('cmdType')
        elock_status = elock_response.get('status')
        elock_id = elock_response.get('elockId')
        
        logger.info(f"ELock {device.device_id}: {cmd_type} - {elock_status}")
        
        # Créer une alerte si nécessaire
        if 'Alarm' in cmd_type or 'Failure' in cmd_type:
            from apps.alerts.models import Alert
            
            severity = 'high' if 'Failure' in cmd_type else 'medium'
            title = f'Alerte ELock - {device.device_id}'
            message = f'Dispositif {device.device_id}: {cmd_type}'
            
            if elock_id:
                message += f' (ELock ID: {elock_id})'
            
            Alert.objects.create(
                user=device.user,
                alert_type='system',
                title=title,
                message=message,
                severity=severity,
                metadata={
                    'elock_response': elock_response,
                    'device_id': device.device_id,
                    'cmd_type': cmd_type
                }
            )
            
            logger.info(f"Alerte ELock créée pour {device.device_id}")
            
    except Exception as e:
        logger.error(f"Erreur traitement ELock: {str(e)}")

# API Views pour l'intégration Totarget
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_totarget_command(request):
    """Envoyer une commande à un dispositif Totarget"""
    try:
        device_id = request.data.get('deviceId')
        command = request.data.get('command')
        
        if not device_id or not command:
            return Response({
                'error': 'deviceId et command requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que le dispositif appartient à l'utilisateur
        try:
            device = TrackerDevice.objects.get(device_id=device_id)
            if device.user != request.user and request.user.role not in ['admin', 'organization']:
                return Response({
                    'error': 'Permission refusée'
                }, status=status.HTTP_403_FORBIDDEN)
        except TrackerDevice.DoesNotExist:
            return Response({
                'error': 'Dispositif non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Envoyer la commande
        result = totarget_integration.send_command(device_id, command)
        
        return Response({
            'status': 'success',
            'result': result,
            'message': 'Commande envoyée avec succès'
        })
        
    except ValueError as e:
        return Response({
            'error': 'Paramètres invalides',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Erreur envoi commande Totarget: {str(e)}")
        return Response({
            'error': 'Erreur lors de l\'envoi de la commande',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_device_status(request, device_id):
    """Obtenir le statut d'un dispositif"""
    try:
        # Valider l'ID du dispositif
        if not totarget_integration._validate_device_id(device_id):
            return Response({
                'error': 'ID de dispositif invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        device = TrackerDevice.objects.get(device_id=device_id)
        
        if device.user != request.user and request.user.role not in ['admin', 'organization']:
            return Response({
                'error': 'Permission refusée'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtenir la dernière position
        last_location = Location.objects.filter(user=device.user).order_by('-timestamp').first()
        
        return Response({
            'device': {
                'id': device.id,
                'device_id': device.device_id,
                'device_type': device.device_type,
                'is_active': device.is_active,
                'last_communication': device.last_communication,
                'battery_level': device.battery_level,
                'signal_strength': device.signal_strength
            },
            'last_location': {
                'latitude': last_location.latitude if last_location else None,
                'longitude': last_location.longitude if last_location else None,
                'timestamp': last_location.timestamp if last_location else None,
                'speed': last_location.speed if last_location else None,
                'heading': last_location.heading if last_location else None
            } if last_location else None
        })
        
    except TrackerDevice.DoesNotExist:
        return Response({
            'error': 'Dispositif non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Erreur serveur',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tracker_device(request):
    """Créer un nouveau dispositif de tracking"""
    try:
        device_id = request.data.get('device_id')
        
        # Valider l'ID du dispositif
        if not totarget_integration._validate_device_id(device_id):
            return Response({
                'error': 'ID de dispositif invalide (doit être 12 chiffres)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si le dispositif existe déjà
        if TrackerDevice.objects.filter(device_id=device_id).exists():
            return Response({
                'error': 'Dispositif déjà enregistré'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        device_data = {
            'device_id': device_id,
            'device_type': request.data.get('device_type', 'gps_tracker'),
            'user': request.user,
            'imei': request.data.get('imei'),
            'phone_number': request.data.get('phone_number'),
            'is_active': True
        }
        
        device = TrackerDevice.objects.create(**device_data)
        
        return Response({
            'id': device.id,
            'device_id': device.device_id,
            'device_type': device.device_type,
            'message': 'Dispositif créé avec succès'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Erreur création dispositif',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Fonctions utilitaires pour les commandes spécifiques
def seal_device(device_id: str, lock_id: str, key: str):
    """Sceller un dispositif ELock"""
    return totarget_integration.seal_device(device_id, lock_id, key)

def unseal_device(device_id: str, lock_id: str, key: str):
    """Desceller un dispositif ELock"""
    return totarget_integration.unseal_device(device_id, lock_id, key)

def request_device_location(device_id: str):
    """Demander la position d'un dispositif"""
    return totarget_integration.request_location(device_id)

def set_device_interval(device_id: str, interval: int):
    """Configurer l'intervalle de tracking"""
    return totarget_integration.set_location_interval(device_id, interval)

def cancel_device_alarm(device_id: str, lock_id: str, key: str):
    """Annuler une alerte de dispositif"""
    return totarget_integration.cancel_alarm(device_id, lock_id, key)

def reboot_device(device_id: str):
    """Redémarrer un dispositif"""
    return totarget_integration.reboot_device(device_id)

def factory_reset_device(device_id: str):
    """Réinitialiser un dispositif aux paramètres d'usine"""
    return totarget_integration.factory_reset(device_id)