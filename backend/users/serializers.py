from rest_framework import serializers
from .models import CustomUser
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'branch', 'admission_year', 'skills', 'github_link', 'linkedin_link', 'instagram_link']
        read_only_fields = ['branch', 'admission_year']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        email = validated_data['email']
        
        # Email parsing logic
        match = re.match(r"([a-z]+)(\d{2})\d{5}@iiti\.ac\.in", email)
        if not match:
            raise serializers.ValidationError("Invalid institutional email format.")
        
        branch = match.group(1).upper()
        admission_year = "20" + match.group(2)
        
        user = CustomUser.objects.create_user(
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            branch=branch,
            admission_year=admission_year
        )
        return user