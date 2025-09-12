from django.core.management.base import BaseCommand
from django.conf import settings
from apps.tracking.models import TrackerDevice
from apps.users.models import User

class Command(BaseCommand):
    help = 'Configuration initiale des dispositifs Totarget GPS'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-devices',
            action='store_true',
            help='Créer des dispositifs de test',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Configuration Totarget GPS Platform')
        )

        # Afficher la configuration actuelle
        self.stdout.write(f"API URL: {getattr(settings, 'TOTARGET_API_URL', 'Non configuré')}")
        self.stdout.write(f"Webhook URL: {getattr(settings, 'TOTARGET_WEBHOOK_URL', 'Non configuré')}")
        
        if options['create_devices']:
            self.create_test_devices()

        self.stdout.write(
            self.style.SUCCESS('✅ Configuration terminée')
        )

    def create_test_devices(self):
        """Créer des dispositifs de test"""
        test_devices = [
            {
                'device_id': '000019246001',
                'device_type': 'gps_tracker',
                'imei': '123456789012345',
                'phone_number': '+221771234567'
            },
            {
                'device_id': '000019246002',
                'device_type': 'gps_tracker',
                'imei': '123456789012346',
                'phone_number': '+221771234568'
            }
        ]

        # Obtenir le premier utilisateur pêcheur
        fisherman = User.objects.filter(role='fisherman').first()
        if not fisherman:
            self.stdout.write(
                self.style.ERROR('❌ Aucun pêcheur trouvé. Créez d\'abord des utilisateurs.')
            )
            return

        for device_data in test_devices:
            device, created = TrackerDevice.objects.get_or_create(
                device_id=device_data['device_id'],
                defaults={
                    **device_data,
                    'user': fisherman,
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Dispositif créé: {device.device_id}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ Dispositif existe déjà: {device.device_id}')
                )