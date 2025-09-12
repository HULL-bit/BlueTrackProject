from rest_framework import serializers
from .models import MediaFile, MediaCollection, MediaCollectionItem, MediaLike, MediaComment


class MediaFileSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les fichiers média"""
    
    file_size_human = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaFile
        fields = [
            'id', 'name', 'original_name', 'file', 'media_type', 'category',
            'size', 'file_size_human', 'mime_type', 'description', 'tags',
            'latitude', 'longitude', 'location_name',
            'width', 'height', 'duration',
            'is_public', 'is_downloadable',
            'download_count', 'view_count', 'like_count',
            'uploaded_by', 'uploaded_by_name', 'is_liked', 'comments_count',
            'created_at', 'updated_at', 'file_url'
        ]
        read_only_fields = [
            'id', 'size', 'mime_type', 'download_count', 'view_count', 'like_count',
            'uploaded_by', 'created_at', 'updated_at', 'file_url', 'file_size_human',
            'is_liked', 'comments_count'
        ]
    
    def create(self, validated_data):
        """Créer un nouveau fichier média avec les métadonnées automatiques"""
        file_obj = validated_data.get('file')
        if file_obj:
            # Déterminer le type de média basé sur le type MIME
            mime_type = file_obj.content_type
            if mime_type.startswith('image/'):
                validated_data['media_type'] = 'image'
            elif mime_type.startswith('video/'):
                validated_data['media_type'] = 'video'
            elif mime_type.startswith('audio/'):
                validated_data['media_type'] = 'audio'
            else:
                validated_data['media_type'] = 'document'
            
            # Définir les métadonnées
            validated_data['mime_type'] = mime_type
            validated_data['size'] = file_obj.size
            validated_data['original_name'] = file_obj.name
        
        return super().create(validated_data)
    
    def get_is_liked(self, obj):
        """Vérifie si l'utilisateur actuel a liké ce média"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_comments_count(self, obj):
        """Retourne le nombre de commentaires"""
        return obj.comments.count()
    
    def get_file_url(self, obj):
        """Génère une URL absolue pour le fichier"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            else:
                # Fallback si pas de request (ex: tests)
                from django.conf import settings
                return f"{settings.MEDIA_URL}{obj.file.name}"
        return None


class MediaFileListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les listes de fichiers média"""
    
    file_size_human = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaFile
        fields = [
            'id', 'name', 'original_name', 'media_type', 'category',
            'file_size_human', 'description', 'tags',
            'latitude', 'longitude', 'location_name',
            'is_public', 'is_downloadable',
            'download_count', 'view_count', 'like_count',
            'uploaded_by_name', 'is_liked', 'comments_count',
            'created_at', 'file_url'
        ]
    
    def get_is_liked(self, obj):
        """Vérifie si l'utilisateur actuel a liké ce média"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_comments_count(self, obj):
        """Retourne le nombre de commentaires"""
        return obj.comments.count()
    
    def get_file_url(self, obj):
        """Génère une URL absolue pour le fichier"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            else:
                # Fallback si pas de request (ex: tests)
                from django.conf import settings
                return f"{settings.MEDIA_URL}{obj.file.name}"
        return None


class MediaCollectionSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les collections de médias"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaCollection
        fields = [
            'id', 'name', 'description', 'is_public',
            'created_by', 'created_by_name', 'media_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_media_count(self, obj):
        """Retourne le nombre de fichiers dans la collection"""
        return obj.media_files.count()


class MediaCollectionItemSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les éléments de collection"""
    
    media_file = MediaFileListSerializer(read_only=True)
    media_file_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MediaCollectionItem
        fields = ['id', 'media_file', 'media_file_id', 'order', 'added_at']
        read_only_fields = ['id', 'added_at']


class MediaUploadSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'upload de fichiers"""
    
    file = serializers.FileField()
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=MediaFile.CATEGORIES, default='other')
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list
    )
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    location_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_public = serializers.BooleanField(default=True)
    is_downloadable = serializers.BooleanField(default=True)
    
    class Meta:
        model = MediaFile
        fields = [
            'id', 'file', 'name', 'description', 'category', 'tags',
            'latitude', 'longitude', 'location_name',
            'is_public', 'is_downloadable'
        ]
        read_only_fields = ['id']
    
    def validate_file(self, value):
        """Valider le fichier uploadé"""
        # Vérifier la taille (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError("Le fichier est trop volumineux (max 50MB)")
        
        # Vérifier les types de fichiers autorisés
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
            'audio/mp3', 'audio/wav', 'audio/ogg',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Type de fichier non autorisé. Types acceptés: images, vidéos, audio, documents"
            )
        
        return value
    
    def create(self, validated_data):
        """Créer un nouveau fichier média avec les métadonnées automatiques"""
        file_obj = validated_data.get('file')
        if file_obj:
            # Déterminer le type de média basé sur le type MIME
            mime_type = file_obj.content_type
            if mime_type.startswith('image/'):
                validated_data['media_type'] = 'image'
            elif mime_type.startswith('video/'):
                validated_data['media_type'] = 'video'
            elif mime_type.startswith('audio/'):
                validated_data['media_type'] = 'audio'
            else:
                validated_data['media_type'] = 'document'
            
            # Définir les métadonnées
            validated_data['mime_type'] = mime_type
            validated_data['size'] = file_obj.size
            validated_data['original_name'] = file_obj.name
        
        return super().create(validated_data)


class MediaLikeSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les likes sur les médias"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = MediaLike
        fields = ['id', 'user', 'user_name', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class MediaCommentSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les commentaires sur les médias"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = MediaComment
        fields = ['id', 'user', 'user_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']