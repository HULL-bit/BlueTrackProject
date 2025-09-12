from django.db import models
from apps.users.models import User

class Zone(models.Model):
    ZONE_TYPES = [
        ('safety', 'Zone de Sécurité'),
        ('fishing', 'Zone de Pêche'),
        ('restricted', 'Zone Restreinte'),
        ('navigation', 'Zone de Navigation'),
        ('anchorage', 'Zone de Mouillage'),
        ('harbor', 'Zone Portuaire'),
        ('marine_reserve', 'Réserve Marine'),
        ('exclusion', 'Zone d\'Exclusion'),
    ]
    
    ZONE_SHAPES = [
        ('circle', 'Cercle'),
        ('polygon', 'Polygone'),
        ('rectangle', 'Rectangle'),
        ('line', 'Ligne'),
    ]
    
    # Informations de base
    name = models.CharField(max_length=255, help_text="Nom de la zone")
    description = models.TextField(blank=True, help_text="Description détaillée de la zone")
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES, help_text="Type de zone")
    zone_shape = models.CharField(max_length=20, choices=ZONE_SHAPES, default='polygon', help_text="Forme de la zone")
    
    # Coordonnées GPS - Centre de la zone
    center_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, help_text="Latitude du centre")
    center_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, help_text="Longitude du centre")
    
    # Coordonnées GPS - Position du rayon (pour définir la taille du cercle)
    radius_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, help_text="Latitude du point de rayon")
    radius_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, help_text="Longitude du point de rayon")
    
    # Coordonnées détaillées (GeoJSON)
    coordinates = models.JSONField(help_text="Coordonnées GeoJSON de la zone")
    
    # Dimensions
    radius = models.DecimalField(max_digits=12, decimal_places=6, null=True, blank=True, help_text="Rayon en mètres (pour les cercles)")
    width = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Largeur en mètres")
    height = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Hauteur en mètres")
    area = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Superficie en m²")
    
    # Propriétés de la zone
    is_active = models.BooleanField(default=True, help_text="Zone active")
    is_restricted = models.BooleanField(default=False, help_text="Zone avec restrictions")
    max_speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Vitesse maximale autorisée (nœuds)")
    
    # Informations temporelles
    valid_from = models.DateTimeField(null=True, blank=True, help_text="Valide à partir de")
    valid_until = models.DateTimeField(null=True, blank=True, help_text="Valide jusqu'à")
    
    # Métadonnées
    color = models.CharField(max_length=7, default='#3B82F6', help_text="Couleur d'affichage (hex)")
    opacity = models.DecimalField(max_digits=3, decimal_places=2, default=0.3, help_text="Opacité d'affichage")
    stroke_color = models.CharField(max_length=7, default='#1E40AF', help_text="Couleur du contour")
    stroke_width = models.IntegerField(default=2, help_text="Épaisseur du contour")
    
    # Relations
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_zones', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['zone_type', 'is_active']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['center_latitude', 'center_longitude']),
            models.Index(fields=['valid_from', 'valid_until']),
        ]
        verbose_name = 'Zone'
        verbose_name_plural = 'Zones'
    
    def __str__(self):
        return f"{self.name} ({self.get_zone_type_display()})"
    
    @property
    def center_coordinates(self):
        """Retourne les coordonnées du centre sous forme de tuple"""
        if self.center_latitude is None or self.center_longitude is None:
            return None
        return (float(self.center_latitude), float(self.center_longitude))
    
    @property
    def radius_coordinates(self):
        """Retourne les coordonnées du rayon sous forme de tuple"""
        if self.radius_latitude is None or self.radius_longitude is None:
            return None
        return (float(self.radius_latitude), float(self.radius_longitude))
    
    def calculate_radius_from_coordinates(self):
        """Calcule le rayon en mètres à partir des coordonnées centre et rayon"""
        if not all([self.center_latitude, self.center_longitude, self.radius_latitude, self.radius_longitude]):
            return None
        
        from math import radians, cos, sin, asin, sqrt
        
        # Formule de Haversine pour calculer la distance entre deux points
        def haversine(lon1, lat1, lon2, lat2):
            # Convertir les degrés en radians
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            
            # Formule de Haversine
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371000  # Rayon de la Terre en mètres
            return c * r
        
        return haversine(
            float(self.center_longitude), float(self.center_latitude),
            float(self.radius_longitude), float(self.radius_latitude)
        )
    
    @property
    def is_valid_now(self):
        """Vérifie si la zone est valide actuellement"""
        from django.utils import timezone
        now = timezone.now()
        
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        
        return True
    
    def get_geojson_feature(self):
        """Retourne la zone sous format GeoJSON Feature"""
        return {
            "type": "Feature",
            "properties": {
                "id": self.id,
                "name": self.name,
                "zone_type": self.zone_type,
                "zone_shape": self.zone_shape,
                "is_active": self.is_active,
                "is_restricted": self.is_restricted,
                "color": self.color,
                "opacity": float(self.opacity),
                "stroke_color": self.stroke_color,
                "stroke_width": self.stroke_width,
                "max_speed": float(self.max_speed) if self.max_speed else None,
                "valid_from": self.valid_from.isoformat() if self.valid_from else None,
                "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            },
            "geometry": self.coordinates
        }