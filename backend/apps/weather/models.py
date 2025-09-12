from django.db import models

class WeatherData(models.Model):
    # Temporarily using decimal fields instead of PostGIS Point
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    wind_direction = models.IntegerField()
    wave_height = models.DecimalField(max_digits=4, decimal_places=2)
    visibility = models.DecimalField(max_digits=5, decimal_places=2)
    pressure = models.DecimalField(max_digits=7, decimal_places=2)
    humidity = models.IntegerField()
    condition = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    forecast_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-forecast_time']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['-forecast_time']),
        ]
    
    def __str__(self):
        return f"Météo {self.forecast_time.strftime('%Y-%m-%d %H:%M')} - {self.temperature}°C"