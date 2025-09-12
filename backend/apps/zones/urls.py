from django.urls import path
from . import views

urlpatterns = [
    path('', views.ZoneListCreateView.as_view(), name='zones'),
    path('<int:pk>/', views.ZoneDetailView.as_view(), name='zone-detail'),
    path('geojson/', views.zones_geojson, name='zones-geojson'),
    path('stats/', views.zones_stats, name='zones-stats'),
]