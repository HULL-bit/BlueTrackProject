from django.db import models
from django.conf import settings
from django.utils import timezone
import os
import uuid


def media_upload_path(instance, filename):
    """Génère un chemin unique pour l'upload des fichiers média"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('media_gallery', filename)


class MediaFile(models.Model):
    """Modèle pour gérer les fichiers média (images, vidéos, documents)"""
    
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
        ('document', 'Document'),
        ('audio', 'Audio'),
    ]
    
    CATEGORIES = [
        ('fishing', 'Pêche'),
        ('boats', 'Bateaux'),
        ('ports', 'Ports'),
        ('weather', 'Météo'),
        ('events', 'Événements'),
        ('zones', 'Zones'),
        ('balises', 'Balises'),
        ('other', 'Autre'),
    ]
    
    # Informations de base
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Nom du fichier")
    original_name = models.CharField(max_length=255, help_text="Nom original du fichier")
    file = models.FileField(upload_to=media_upload_path, help_text="Fichier uploadé")
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    
    # Métadonnées
    size = models.BigIntegerField(help_text="Taille du fichier en octets")
    mime_type = models.CharField(max_length=100, help_text="Type MIME du fichier")
    description = models.TextField(blank=True, null=True, help_text="Description du fichier")
    tags = models.JSONField(default=list, blank=True, help_text="Tags associés au fichier")
    
    # Informations de localisation GPS (optionnelles)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, help_text="Latitude GPS")
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, help_text="Longitude GPS")
    location_name = models.CharField(max_length=255, blank=True, null=True, help_text="Nom du lieu")
    
    # Métadonnées techniques
    width = models.IntegerField(null=True, blank=True, help_text="Largeur (pour images/vidéos)")
    height = models.IntegerField(null=True, blank=True, help_text="Hauteur (pour images/vidéos)")
    duration = models.DurationField(null=True, blank=True, help_text="Durée (pour vidéos/audio)")
    
    # Visibilité et permissions
    is_public = models.BooleanField(default=True, help_text="Fichier visible par tous")
    is_downloadable = models.BooleanField(default=True, help_text="Fichier téléchargeable")
    
    # Statistiques
    download_count = models.PositiveIntegerField(default=0, help_text="Nombre de téléchargements")
    view_count = models.PositiveIntegerField(default=0, help_text="Nombre de vues")
    like_count = models.PositiveIntegerField(default=0, help_text="Nombre de likes")
    
    # Relations
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_media',
        help_text="Utilisateur qui a uploadé le fichier",
        null=True,  # Permettre les utilisateurs anonymes
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['media_type', 'category']),
            models.Index(fields=['is_public', 'is_downloadable']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['latitude', 'longitude']),
        ]
        verbose_name = 'Fichier Média'
        verbose_name_plural = 'Fichiers Médias'
    
    def __str__(self):
        return f"{self.original_name} ({self.get_media_type_display()})"
    
    @property
    def file_size_human(self):
        """Retourne la taille du fichier formatée"""
        size = self.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    @property
    def file_url(self):
        """Retourne l'URL publique du fichier"""
        if self.file:
            # Générer une URL absolue pour l'affichage
            from django.conf import settings
            from django.urls import reverse
            return f"{settings.MEDIA_URL}{self.file.name}"
        return None
    
    def increment_view_count(self):
        """Incrémente le compteur de vues"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def increment_download_count(self):
        """Incrémente le compteur de téléchargements"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
    
    def increment_like_count(self):
        """Incrémente le compteur de likes"""
        self.like_count += 1
        self.save(update_fields=['like_count'])
    
    def decrement_like_count(self):
        """Décrémente le compteur de likes"""
        if self.like_count > 0:
            self.like_count -= 1
            self.save(update_fields=['like_count'])


class MediaCollection(models.Model):
    """Modèle pour organiser les fichiers média en collections"""
    
    name = models.CharField(max_length=255, help_text="Nom de la collection")
    description = models.TextField(blank=True, null=True, help_text="Description de la collection")
    is_public = models.BooleanField(default=True, help_text="Collection visible par tous")
    
    # Relations
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_collections'
    )
    media_files = models.ManyToManyField(
        MediaFile,
        through='MediaCollectionItem',
        related_name='collections'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Collection Média'
        verbose_name_plural = 'Collections Médias'
    
    def __str__(self):
        return self.name


class MediaCollectionItem(models.Model):
    """Modèle intermédiaire pour les éléments de collection"""
    
    collection = models.ForeignKey(MediaCollection, on_delete=models.CASCADE)
    media_file = models.ForeignKey(MediaFile, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0, help_text="Ordre d'affichage")
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-added_at']
        unique_together = ['collection', 'media_file']


class MediaLike(models.Model):
    """Modèle pour les likes sur les fichiers média"""
    
    media_file = models.ForeignKey(
        MediaFile,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='media_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['media_file', 'user']
        ordering = ['-created_at']
        verbose_name = 'Like Média'
        verbose_name_plural = 'Likes Médias'
    
    def __str__(self):
        return f"{self.user.username} aime {self.media_file.original_name}"


class MediaComment(models.Model):
    """Modèle pour les commentaires sur les fichiers média"""
    
    media_file = models.ForeignKey(
        MediaFile,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='media_comments'
    )
    content = models.TextField(help_text="Contenu du commentaire")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Commentaire Média'
        verbose_name_plural = 'Commentaires Médias'
    
    def __str__(self):
        return f"Commentaire de {self.user.username} sur {self.media_file.original_name}"

