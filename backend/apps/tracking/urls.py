from django.urls import path
from . import views
from .totarget_integration import totarget_webhook, send_totarget_command, get_device_status, create_tracker_device

urlpatterns = [
    path('locations/', views.LocationListCreateView.as_view(), name='locations'),
    path('trips/', views.TripListCreateView.as_view(), name='trips'),
    path('devices/', views.TrackerDeviceListView.as_view(), name='devices'),
    path('devices/<str:device_id>/status/', views.device_status, name='device-status'),
    path('balises/', views.BaliseListCreateView.as_view(), name='balises'),
    path('balises/<int:pk>/', views.BaliseDetailView.as_view(), name='balise-detail'),
    path('balises/geojson/', views.balises_geojson, name='balises-geojson'),
    path('live-positions/', views.live_positions, name='live-positions'),
    path('webhook/tracker/', views.tracker_webhook, name='tracker-webhook'),
    path('webhook/totarget/', totarget_webhook, name='totarget-webhook'),
    path('totarget/command/', send_totarget_command, name='totarget-command'),
    path('totarget/device/<str:device_id>/status/', get_device_status, name='totarget-device-status'),
    path('totarget/device/create/', create_tracker_device, name='create-tracker-device'),
]

