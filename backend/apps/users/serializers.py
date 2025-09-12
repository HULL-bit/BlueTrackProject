from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'boat_name', 'license_number', 'emergency_contact', 
                 'organization_name', 'organization_type']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'avatar', 
                 'is_active_session', 'last_location_update', 'profile']
        read_only_fields = ['id']

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(help_text="Email ou nom d'utilisateur")
    password = serializers.CharField()
    
    def validate(self, attrs):
        email_or_username = attrs.get('email')
        password = attrs.get('password')
        
        if email_or_username and password:
            user = None
            
            # Essayer d'abord avec l'email/username comme username
            user = authenticate(username=email_or_username, password=password)
            
            if not user:
                # Si ça ne marche pas, chercher l'utilisateur par email
                try:
                    user_obj = User.objects.get(email=email_or_username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if not user:
                raise serializers.ValidationError('Identifiants invalides')
            if not user.is_active:
                raise serializers.ValidationError('Compte désactivé')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email/Username et mot de passe requis')
        
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'role', 'phone', 'profile']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        
        # Vérifier si l'email existe déjà
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà")
        
        # Générer un username unique si nécessaire
        base_username = attrs.get('username', attrs['email'].split('@')[0])
        username = base_username
        counter = 1
        
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        attrs['username'] = username
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        validated_data.pop('confirm_password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'fisherman'),
            phone=validated_data.get('phone', '')
        )
        
        # Créer le profil si des données sont fournies
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        else:
            # Créer un profil vide par défaut
            UserProfile.objects.create(user=user)
        
        return user