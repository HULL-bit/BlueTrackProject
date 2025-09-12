from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
import time
from .models import Message, Channel
from .serializers import MessageSerializer, ChannelSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Retourner tous les messages du canal général
        return Message.objects.all().order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Upload d'images pour le chat
    """
    try:
        image = request.FILES.get('image')
        channel_id = request.data.get('channel_id', 'general')
        
        if not image:
            return Response({'error': 'Aucune image fournie'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que c'est bien une image
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if image.content_type not in allowed_types:
            return Response({'error': 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier la taille du fichier (max 10MB)
        if image.size > 10 * 1024 * 1024:
            return Response({'error': 'Image trop volumineuse (max 10MB)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer un message avec l'image
        message = Message.objects.create(
            sender=request.user,
            receiver=request.user,  # Pour l'instant, on met le même utilisateur
            channel_id=channel_id,
            content=f"Image partagée: {image.name}",
            message_type='image',
            image=image
        )
        
        # Retourner les données du message avec l'URL de l'image
        serializer = MessageSerializer(message, context={'request': request})
        
        return Response({
            'message': 'Image uploadée avec succès',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de l\'upload de l\'image',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChannelListCreateView(generics.ListCreateAPIView):
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Channel.objects.filter(is_active=True)
        return Channel.objects.filter(
            models.Q(channel_type='public') | 
            models.Q(members=user),
            is_active=True
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)