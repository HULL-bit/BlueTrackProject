#!/usr/bin/env python
"""
Script pour créer des données de test pour les donations
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')
django.setup()

from apps.donations.models import Donation, DonationGoal
from django.contrib.auth import get_user_model

User = get_user_model()

def create_donation_goals():
    """Créer des objectifs de donation"""
    print("🎯 Création des objectifs de donation...")
    
    goals_data = [
        {
            'title': 'Amélioration du système de tracking GPS',
            'description': 'Financement pour améliorer la précision et la fiabilité du système de suivi GPS des pirogues',
            'target_amount': Decimal('5000000'),  # 5 millions FCFA
            'current_amount': Decimal('1250000'),  # 1.25 million FCFA déjà collecté
            'is_active': True,
            'deadline': datetime.now() + timedelta(days=90)
        },
        {
            'title': 'Formation des pêcheurs à la sécurité maritime',
            'description': 'Programme de formation pour sensibiliser les pêcheurs aux bonnes pratiques de sécurité en mer',
            'target_amount': Decimal('2000000'),  # 2 millions FCFA
            'current_amount': Decimal('750000'),   # 750k FCFA déjà collecté
            'is_active': True,
            'deadline': datetime.now() + timedelta(days=60)
        },
        {
            'title': 'Équipement de sauvetage pour les pirogues',
            'description': 'Achat de gilets de sauvetage, bouées et équipements de sécurité pour les pirogues',
            'target_amount': Decimal('3000000'),  # 3 millions FCFA
            'current_amount': Decimal('500000'),   # 500k FCFA déjà collecté
            'is_active': True,
            'deadline': datetime.now() + timedelta(days=120)
        }
    ]
    
    for goal_data in goals_data:
        goal, created = DonationGoal.objects.get_or_create(
            title=goal_data['title'],
            defaults=goal_data
        )
        if created:
            print(f"✅ Objectif créé: {goal.title}")
        else:
            print(f"ℹ️  Objectif existant: {goal.title}")

def create_sample_donations():
    """Créer des donations d'exemple"""
    print("💝 Création des donations d'exemple...")
    
    donations_data = [
        {
            'donor_name': 'Moussa Diop',
            'donor_email': 'moussa.diop@email.com',
            'donor_phone': '+221 77 123 45 67',
            'donor_organization': 'Association des Pêcheurs de Dakar',
            'donation_type': 'financial',
            'amount': Decimal('100000'),
            'description': 'Don pour soutenir le développement du système de sécurité maritime',
            'purpose': 'Formation des pêcheurs',
            'status': 'confirmed',
            'is_anonymous': False,
            'is_public': True,
            'created_at': datetime.now() - timedelta(days=5)
        },
        {
            'donor_name': 'Fatou Sarr',
            'donor_email': 'fatou.sarr@email.com',
            'donor_phone': '+221 78 234 56 78',
            'donor_organization': 'ONG Maritime Sénégal',
            'donation_type': 'financial',
            'amount': Decimal('250000'),
            'description': 'Contribution pour l\'amélioration du système GPS',
            'purpose': 'Équipement technique',
            'status': 'confirmed',
            'is_anonymous': False,
            'is_public': True,
            'created_at': datetime.now() - timedelta(days=3)
        },
        {
            'donor_name': 'Ibrahima Fall',
            'donor_email': 'ibrahima.fall@email.com',
            'donor_phone': '+221 76 345 67 89',
            'donor_organization': '',
            'donation_type': 'financial',
            'amount': Decimal('50000'),
            'description': 'Don personnel pour la sécurité des pêcheurs',
            'purpose': 'Général',
            'status': 'confirmed',
            'is_anonymous': False,
            'is_public': True,
            'created_at': datetime.now() - timedelta(days=1)
        },
        {
            'donor_name': 'Anonyme',
            'donor_email': 'anonyme@blue-track.com',
            'donor_phone': '',
            'donor_organization': '',
            'donation_type': 'financial',
            'amount': Decimal('75000'),
            'description': 'Don anonyme pour soutenir la cause',
            'purpose': 'Général',
            'status': 'confirmed',
            'is_anonymous': True,
            'is_public': True,
            'created_at': datetime.now() - timedelta(hours=12)
        },
        {
            'donor_name': 'Aminata Ba',
            'donor_email': 'aminata.ba@email.com',
            'donor_phone': '+221 77 456 78 90',
            'donor_organization': 'Entreprise Maritime Ba',
            'donation_type': 'equipment',
            'amount': None,
            'description': 'Don de 20 gilets de sauvetage et 10 bouées de sauvetage',
            'purpose': 'Équipement de sécurité',
            'status': 'confirmed',
            'is_anonymous': False,
            'is_public': True,
            'created_at': datetime.now() - timedelta(days=2)
        },
        {
            'donor_name': 'Cheikh Ndiaye',
            'donor_email': 'cheikh.ndiaye@email.com',
            'donor_phone': '+221 78 567 89 01',
            'donor_organization': 'Centre de Formation Maritime',
            'donation_type': 'service',
            'amount': None,
            'description': 'Formation gratuite de 2 jours sur la sécurité maritime pour 50 pêcheurs',
            'purpose': 'Formation',
            'status': 'pending',
            'is_anonymous': False,
            'is_public': True,
            'created_at': datetime.now() - timedelta(hours=6)
        }
    ]
    
    for donation_data in donations_data:
        donation, created = Donation.objects.get_or_create(
            donor_email=donation_data['donor_email'],
            description=donation_data['description'],
            defaults=donation_data
        )
        if created:
            print(f"✅ Donation créée: {donation.display_name} - {donation.get_donation_type_display()}")
        else:
            print(f"ℹ️  Donation existante: {donation.display_name}")

def main():
    """Fonction principale"""
    print("🚀 Création des données de test pour les donations...")
    print("=" * 60)
    
    try:
        create_donation_goals()
        print()
        create_sample_donations()
        print()
        print("✅ Données de test créées avec succès !")
        print()
        print("📊 Résumé:")
        print(f"   - Objectifs de donation: {DonationGoal.objects.count()}")
        print(f"   - Donations: {Donation.objects.count()}")
        print(f"   - Donations confirmées: {Donation.objects.filter(status='confirmed').count()}")
        print(f"   - Donations anonymes: {Donation.objects.filter(is_anonymous=True).count()}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
