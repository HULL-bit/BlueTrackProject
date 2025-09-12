from rest_framework import permissions

class IsAdminOrOrganization(permissions.BasePermission):
    """
    Permission personnalisée pour permettre l'accès uniquement aux administrateurs et organisations.
    Les pêcheurs n'ont pas accès aux fonctionnalités de tracking GPS.
    """
    
    def has_permission(self, request, view):
        # L'utilisateur doit être authentifié
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Vérifier le rôle de l'utilisateur
        user_role = getattr(request.user, 'role', None)
        
        # Seuls les administrateurs et organisations ont accès
        return user_role in ['admin', 'organization']


class IsAdminOnly(permissions.BasePermission):
    """
    Permission pour les fonctionnalités réservées aux administrateurs uniquement.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission pour permettre l'accès au propriétaire de la ressource ou aux administrateurs.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Les administrateurs ont toujours accès
        if user_role == 'admin':
            return True
        
        # Pour les autres opérations, vérifier si c'est le propriétaire
        return True
    
    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        
        # Les administrateurs ont toujours accès
        if user_role == 'admin':
            return True
        
        # Vérifier si l'utilisateur est le propriétaire de l'objet
        if hasattr(obj, 'uploaded_by'):
            return obj.uploaded_by == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class CanAccessMedia(permissions.BasePermission):
    """
    Permission pour l'accès aux médias selon le rôle.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Tous les utilisateurs authentifiés peuvent accéder aux médias
        return True
    
    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        
        # Les administrateurs ont toujours accès
        if user_role == 'admin':
            return True
        
        # Vérifier si le média est public ou si l'utilisateur est le propriétaire
        if hasattr(obj, 'is_public') and obj.is_public:
            return True
        
        if hasattr(obj, 'uploaded_by'):
            return obj.uploaded_by == request.user
        
        return False
