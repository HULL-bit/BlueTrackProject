from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from django.db.models import Q
from apps.users.permissions import CanAccessMedia, IsOwnerOrAdmin
from .models import MediaFile, MediaCollection, MediaLike, MediaComment
from .serializers import (
    MediaFileSerializer, MediaFileListSerializer, 
    MediaCollectionSerializer, MediaUploadSerializer,
    MediaLikeSerializer, MediaCommentSerializer
)
import mimetypes
import os


class MediaFileListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des fichiers média"""
    
    permission_classes = []  # Aucune permission requise - accès libre
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MediaFileListSerializer
        return MediaUploadSerializer
    
    def get_queryset(self):
        """Filtrer les fichiers selon les permissions et paramètres"""
        queryset = MediaFile.objects.all()
        
        # Accès libre - montrer tous les fichiers publics
        # Si l'utilisateur est connecté et admin, montrer tous les fichiers
        if self.request.user.is_authenticated and self.request.user.is_staff:
            pass  # Montrer tous les fichiers
        else:
            # Pour tous les autres (connectés ou anonymes), montrer seulement les fichiers publics
            queryset = queryset.filter(is_public=True)
        
        # Filtres optionnels
        media_type = self.request.query_params.get('type')
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset.select_related('uploaded_by').order_by('-created_at')
    
    def get_serializer_context(self):
        """Ajouter le contexte de la requête aux sérialiseurs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Créer un nouveau fichier média"""
        # Gérer les utilisateurs anonymes
        if self.request.user.is_authenticated:
            serializer.save(uploaded_by=self.request.user)
        else:
            # Pour les utilisateurs anonymes, sauvegarder sans utilisateur
            serializer.save(uploaded_by=None)


class MediaFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour les détails d'un fichier média"""
    
    permission_classes = []  # Accès libre pour voir les détails
    serializer_class = MediaFileSerializer
    
    def get_queryset(self):
        """Filtrer selon les permissions"""
        queryset = MediaFile.objects.all()
        
        # Accès libre - montrer tous les fichiers publics
        if self.request.user.is_authenticated and self.request.user.is_staff:
            pass  # Montrer tous les fichiers pour les admins
        elif self.request.user.is_authenticated:
            # Utilisateur connecté : montrer les fichiers publics + ses propres fichiers
            queryset = queryset.filter(
                Q(is_public=True) | Q(uploaded_by=self.request.user)
            )
        else:
            # Utilisateur anonyme : montrer les fichiers publics + fichiers sans uploaded_by
            queryset = queryset.filter(
                Q(is_public=True) | Q(uploaded_by__isnull=True)
            )
        
        return queryset.select_related('uploaded_by')
    
    def get_serializer_context(self):
        """Ajouter le contexte de la requête aux sérialiseurs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        """Permettre la suppression pour tous les utilisateurs"""
        # Permettre la suppression pour tous (utilisateurs anonymes inclus)
        instance.delete()
    
    def retrieve(self, request, *args, **kwargs):
        """Récupérer un fichier et incrémenter le compteur de vues"""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Supprimer un fichier média"""
        instance = self.get_object()
        
        # Vérifier les permissions de suppression
        if request.user.is_authenticated:
            # Utilisateur connecté : peut supprimer ses propres fichiers ou être admin
            if instance.uploaded_by == request.user or request.user.is_staff:
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {'error': 'Vous ne pouvez supprimer que vos propres fichiers'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            # Utilisateur anonyme : peut supprimer les fichiers sans uploaded_by
            if instance.uploaded_by is None:
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {'error': 'Vous devez être connecté pour supprimer ce fichier'}, 
                    status=status.HTTP_403_FORBIDDEN
                )


@api_view(['GET'])
@permission_classes([])  # Accès libre pour télécharger
def download_media_file(request, pk):
    """Télécharger un fichier média"""
    try:
        media_file = get_object_or_404(MediaFile, pk=pk)
        
        # Vérifier les permissions - accès libre pour les fichiers publics
        if not media_file.is_public:
            # Seuls les admins peuvent télécharger les fichiers privés
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {'error': 'Ce fichier n\'est pas public'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Vérifier si le fichier est téléchargeable
        if not media_file.is_downloadable:
            return Response(
                {'error': 'Ce fichier n\'est pas téléchargeable'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Incrémenter le compteur de téléchargements
        media_file.increment_download_count()
        
        # Servir le fichier
        if not media_file.file:
            raise Http404("Fichier non trouvé")
        
        # Déterminer le type MIME
        content_type, _ = mimetypes.guess_type(media_file.file.path)
        if not content_type:
            content_type = media_file.mime_type or 'application/octet-stream'
        
        # Lire le fichier
        with open(media_file.file.path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{media_file.original_name}"'
            response['Content-Length'] = media_file.size
            return response
            
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du téléchargement: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([])  # Accès libre pour les statistiques
def media_stats(request):
    """Obtenir les statistiques des fichiers média"""
    try:
        # Statistiques globales (seulement les fichiers publics)
        public_files = MediaFile.objects.filter(is_public=True)
        total_files = public_files.count()
        total_size = sum(public_files.values_list('size', flat=True))
        
        # Statistiques par type (seulement les fichiers publics)
        type_stats = {}
        for media_type, _ in MediaFile.MEDIA_TYPES:
            count = public_files.filter(media_type=media_type).count()
            type_stats[media_type] = count
        
        # Statistiques par catégorie (seulement les fichiers publics)
        category_stats = {}
        for category, _ in MediaFile.CATEGORIES:
            count = public_files.filter(category=category).count()
            category_stats[category] = count
        
        # Statistiques de l'utilisateur (si connecté)
        user_files = 0
        user_size = 0
        if request.user.is_authenticated:
            user_files = MediaFile.objects.filter(uploaded_by=request.user).count()
            user_size = sum(
                MediaFile.objects.filter(uploaded_by=request.user).values_list('size', flat=True)
            )
        
        return Response({
            'global': {
                'total_files': total_files,
                'total_size': total_size,
                'total_size_human': f"{total_size / (1024*1024*1024):.2f} GB" if total_size > 1024*1024*1024 else f"{total_size / (1024*1024):.2f} MB"
            },
            'by_type': type_stats,
            'by_category': category_stats,
            'user': {
                'files_count': user_files,
                'files_size': user_size,
                'files_size_human': f"{user_size / (1024*1024):.2f} MB" if user_size > 1024*1024 else f"{user_size / 1024:.2f} KB"
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du calcul des statistiques: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class MediaCollectionListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des collections de médias"""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MediaCollectionSerializer
    
    def get_queryset(self):
        """Filtrer les collections selon les permissions"""
        queryset = MediaCollection.objects.all()
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(is_public=True) | Q(created_by=self.request.user)
            )
        
        return queryset.select_related('created_by').prefetch_related('media_files')


class MediaCollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour les détails d'une collection de médias"""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MediaCollectionSerializer
    
    def get_queryset(self):
        """Filtrer selon les permissions"""
        queryset = MediaCollection.objects.all()
        
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(is_public=True) | Q(created_by=self.request.user)
            )
        
        return queryset.select_related('created_by').prefetch_related('media_files')


@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, pk):
    """Ajouter ou retirer un like sur un fichier média"""
    try:
        media_file = get_object_or_404(MediaFile, pk=pk)
        
        # Vérifier les permissions
        if not media_file.is_public and media_file.uploaded_by != request.user:
            if not request.user.is_staff:
                return Response(
                    {'error': 'Accès non autorisé'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if request.method == 'POST':
            # Ajouter un like
            like, created = MediaLike.objects.get_or_create(
                media_file=media_file,
                user=request.user
            )
            if created:
                media_file.increment_like_count()
                return Response({'message': 'Like ajouté'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Déjà liké'}, status=status.HTTP_200_OK)
        
        elif request.method == 'DELETE':
            # Retirer un like
            try:
                like = MediaLike.objects.get(media_file=media_file, user=request.user)
                like.delete()
                media_file.decrement_like_count()
                return Response({'message': 'Like retiré'}, status=status.HTTP_200_OK)
            except MediaLike.DoesNotExist:
                return Response({'message': 'Pas de like à retirer'}, status=status.HTTP_404_NOT_FOUND)
                
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la gestion du like: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class MediaCommentListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des commentaires sur un fichier média"""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MediaCommentSerializer
    
    def get_queryset(self):
        """Récupérer les commentaires d'un fichier média"""
        media_file_id = self.kwargs.get('pk')
        return MediaComment.objects.filter(
            media_file_id=media_file_id
        ).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        """Créer un nouveau commentaire"""
        media_file_id = self.kwargs.get('pk')
        media_file = get_object_or_404(MediaFile, pk=media_file_id)
        
        # Vérifier les permissions
        if not media_file.is_public and media_file.uploaded_by != self.request.user:
            if not self.request.user.is_staff:
                raise permissions.PermissionDenied('Accès non autorisé')
        
        serializer.save(user=self.request.user, media_file=media_file)


class MediaCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour les détails d'un commentaire"""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MediaCommentSerializer
    
    def get_queryset(self):
        """Filtrer selon les permissions"""
        return MediaComment.objects.filter(user=self.request.user)