from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class Donation(models.Model):
    """Modèle pour les donations à la plateforme Blue-Track"""
    
    DONATION_TYPES = [
        ('financial', 'Don financier'),
        ('equipment', 'Équipement'),
        ('service', 'Service'),
        ('other', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    # Informations du donateur
    donor_name = models.CharField(max_length=200, verbose_name="Nom du donateur")
    donor_email = models.EmailField(verbose_name="Email du donateur")
    donor_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone du donateur")
    donor_organization = models.CharField(max_length=200, blank=True, verbose_name="Organisation")
    
    # Informations de la donation
    donation_type = models.CharField(
        max_length=20, 
        choices=DONATION_TYPES, 
        default='financial',
        verbose_name="Type de donation"
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Montant (FCFA)"
    )
    description = models.TextField(verbose_name="Description de la donation")
    purpose = models.TextField(
        blank=True, 
        verbose_name="Objectif de la donation"
    )
    
    # Statut et suivi
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Statut"
    )
    is_anonymous = models.BooleanField(
        default=False, 
        verbose_name="Don anonyme"
    )
    is_public = models.BooleanField(
        default=True, 
        verbose_name="Affichage public"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de confirmation")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de finalisation")
    
    # Utilisateur qui a traité la donation (admin)
    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Traité par"
    )
    
    class Meta:
        verbose_name = "Donation"
        verbose_name_plural = "Donations"
        ordering = ['-created_at']
    
    def __str__(self):
        donor_display = "Anonyme" if self.is_anonymous else self.donor_name
        amount_display = f"{self.amount} FCFA" if self.amount else "Non financier"
        return f"{donor_display} - {amount_display} ({self.get_donation_type_display()})"
    
    @property
    def display_name(self):
        """Retourne le nom à afficher (anonyme ou réel)"""
        return "Donateur anonyme" if self.is_anonymous else self.donor_name
    
    @property
    def display_organization(self):
        """Retourne l'organisation à afficher (anonyme ou réelle)"""
        if self.is_anonymous:
            return None
        return self.donor_organization if self.donor_organization else None


class DonationGoal(models.Model):
    """Modèle pour les objectifs de donation de la plateforme"""
    
    title = models.CharField(max_length=200, verbose_name="Titre de l'objectif")
    description = models.TextField(verbose_name="Description")
    target_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Montant cible (FCFA)"
    )
    current_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Montant actuel (FCFA)"
    )
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    deadline = models.DateField(null=True, blank=True, verbose_name="Date limite")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    
    class Meta:
        verbose_name = "Objectif de donation"
        verbose_name_plural = "Objectifs de donation"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.current_amount}/{self.target_amount} FCFA"
    
    @property
    def progress_percentage(self):
        """Calcule le pourcentage de progression"""
        if self.target_amount <= 0:
            return 0
        return min(100, (self.current_amount / self.target_amount) * 100)
    
    @property
    def remaining_amount(self):
        """Calcule le montant restant"""
        return max(0, self.target_amount - self.current_amount)

