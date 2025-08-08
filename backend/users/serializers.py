# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Domain, Role
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'name', 'description']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'can_manage_events', 'can_manage_projects']

class UserSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'name', 'email', 'password', 'role', 'role_name',
            'domain', 'domain_name', 'batch', 'github_link', 'instagram_link',
            'linkedin_link', 'profile_pic', 'skills', 'is_active', 'created_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        return data

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # You can add custom claims to the token itself if needed
        # token['first_name'] = user.first_name
        
        return token

    def validate(self, attrs):
        # This method is called upon login
        data = super().validate(attrs)

        # Add user data to the response
        serializer = UserSerializer(self.user)
        data['user'] = serializer.data
        
        return data