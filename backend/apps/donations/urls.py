from django.urls import path
from . import views

app_name = 'donations'

urlpatterns = [
    # Gestion des donations
    path('', views.DonationListCreateView.as_view(), name='donation-list-create'),
    path('<int:pk>/', views.DonationDetailView.as_view(), name='donation-detail'),
    path('public/', views.PublicDonationListView.as_view(), name='public-donation-list'),
    path('stats/', views.donation_stats, name='donation-stats'),
    path('<int:donation_id>/confirm/', views.confirm_donation, name='confirm-donation'),
    path('<int:donation_id>/complete/', views.complete_donation, name='complete-donation'),
    
    # Objectifs de donation
    path('goals/', views.DonationGoalListView.as_view(), name='donation-goal-list'),
]

