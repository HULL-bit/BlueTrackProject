from django.urls import path
from . import views

urlpatterns = [
    path('', views.AlertListCreateView.as_view(), name='alerts'),
    path('<int:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge-alert'),
]