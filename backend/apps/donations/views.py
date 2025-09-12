from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from .models import Donation, DonationGoal
from .serializers import (
    DonationSerializer, DonationCreateSerializer, DonationGoalSerializer,
    PublicDonationSerializer
)

class DonationListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des donations"""
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DonationCreateSerializer
        return DonationSerializer
    
    def get_queryset(self):
        """Filtrer les donations selon les permissions"""
        if self.request.user.is_authenticated and self.request.user.is_staff:
            # Les admins voient toutes les donations
            return Donation.objects.all()
        else:
            # Les utilisateurs normaux ne voient que les donations publiques
            return Donation.objects.filter(is_public=True, status__in=['confirmed', 'completed'])
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # N'importe qui peut faire une donation
            return [permissions.AllowAny()]
        else:
            # Seuls les utilisateurs authentifiés peuvent voir la liste
            return [permissions.IsAuthenticated()]


class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour les détails d'une donation"""
    
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Donation.objects.all()
        else:
            return Donation.objects.filter(is_public=True, status__in=['confirmed', 'completed'])


class PublicDonationListView(generics.ListAPIView):
    """Vue publique pour lister les donations (pour l'affichage sur le site)"""
    
    serializer_class = PublicDonationSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Retourner seulement les donations publiques confirmées"""
        return Donation.objects.filter(
            is_public=True,
            status__in=['confirmed', 'completed']
        ).order_by('-created_at')[:50]  # Limiter à 50 donations récentes


class DonationGoalListView(generics.ListAPIView):
    """Vue pour lister les objectifs de donation"""
    
    serializer_class = DonationGoalSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return DonationGoal.objects.filter(is_active=True).order_by('-created_at')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def donation_stats(request):
    """API pour obtenir les statistiques des donations"""
    
    # Statistiques générales
    total_donations = Donation.objects.filter(status__in=['confirmed', 'completed']).count()
    total_amount = Donation.objects.filter(
        status__in=['confirmed', 'completed'],
        amount__isnull=False
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Donations récentes (30 derniers jours)
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    recent_donations = Donation.objects.filter(
        created_at__gte=thirty_days_ago,
        status__in=['confirmed', 'completed']
    ).count()
    
    recent_amount = Donation.objects.filter(
        created_at__gte=thirty_days_ago,
        status__in=['confirmed', 'completed'],
        amount__isnull=False
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Objectifs actifs
    active_goals = DonationGoal.objects.filter(is_active=True)
    goals_data = []
    for goal in active_goals:
        goals_data.append({
            'id': goal.id,
            'title': goal.title,
            'description': goal.description,
            'target_amount': float(goal.target_amount),
            'current_amount': float(goal.current_amount),
            'progress_percentage': goal.progress_percentage,
            'remaining_amount': float(goal.remaining_amount),
            'deadline': goal.deadline
        })
    
    return Response({
        'total_donations': total_donations,
        'total_amount': float(total_amount),
        'recent_donations': recent_donations,
        'recent_amount': float(recent_amount),
        'active_goals': goals_data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_donation(request, donation_id):
    """API pour confirmer une donation (admin seulement)"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        donation = Donation.objects.get(id=donation_id)
        donation.status = 'confirmed'
        donation.confirmed_at = timezone.now()
        donation.processed_by = request.user
        donation.save()
        
        # Mettre à jour les objectifs de donation si c'est financier
        if donation.donation_type == 'financial' and donation.amount:
            # Mettre à jour le premier objectif actif
            active_goal = DonationGoal.objects.filter(is_active=True).first()
            if active_goal:
                active_goal.current_amount += donation.amount
                active_goal.save()
        
        return Response({
            'message': 'Donation confirmée avec succès',
            'donation': DonationSerializer(donation).data
        })
        
    except Donation.DoesNotExist:
        return Response(
            {'error': 'Donation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_donation(request, donation_id):
    """API pour marquer une donation comme terminée (admin seulement)"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission refusée'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        donation = Donation.objects.get(id=donation_id)
        donation.status = 'completed'
        donation.completed_at = timezone.now()
        donation.processed_by = request.user
        donation.save()
        
        return Response({
            'message': 'Donation marquée comme terminée',
            'donation': DonationSerializer(donation).data
        })
        
    except Donation.DoesNotExist:
        return Response(
            {'error': 'Donation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )

