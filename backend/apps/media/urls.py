from django.urls import path
from . import views

app_name = 'media'

urlpatterns = [
    # Fichiers média
    path('files/', views.MediaFileListCreateView.as_view(), name='media-file-list-create'),
    path('files/<uuid:pk>/', views.MediaFileDetailView.as_view(), name='media-file-detail'),
    path('files/<uuid:pk>/download/', views.download_media_file, name='media-file-download'),
    path('files/<uuid:pk>/like/', views.toggle_like, name='media-file-like'),
    
    # Commentaires
    path('files/<uuid:pk>/comments/', views.MediaCommentListCreateView.as_view(), name='media-comment-list-create'),
    path('comments/<int:pk>/', views.MediaCommentDetailView.as_view(), name='media-comment-detail'),
    
    # Collections de médias
    path('collections/', views.MediaCollectionListCreateView.as_view(), name='media-collection-list-create'),
    path('collections/<int:pk>/', views.MediaCollectionDetailView.as_view(), name='media-collection-detail'),
    
    # Statistiques
    path('stats/', views.media_stats, name='media-stats'),
]