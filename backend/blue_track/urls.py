from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/tracking/', include('apps.tracking.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
    path('api/communication/', include('apps.communication.urls')),
    path('api/zones/', include('apps.zones.urls')),
    path('api/weather/', include('apps.weather.urls')),
    path('api/donations/', include('apps.donations.urls')),
    path('api/media/', include('apps.media.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)