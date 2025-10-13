from rest_framework import serializers
from .models import CustomUser, Skill
import re

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name']

class UserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        help_text="List of skill names to add to user"
    )
    image_url = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'domain', 'year', 'bio', 'image', 'image_url', 'skills', 'skill_names', 'github_link', 'linkedin_link', 'is_onboarded']
        read_only_fields = ['email', 'role', 'domain', 'year']  # These fields can only be set by presidents

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_is_onboarded(self, value):
        """Convert string values to boolean for FormData compatibility"""
        print(f"DEBUG: validate_is_onboarded called with value: {value} (type: {type(value)})")
        if isinstance(value, str):
            result = value.lower() in ('true', '1', 'yes', 'on')
            print(f"DEBUG: String value '{value}' converted to boolean: {result}")
            return result
        result = bool(value)
        print(f"DEBUG: Non-string value converted to boolean: {result}")
        return result

    def update(self, instance, validated_data):
        """Custom update method to handle image uploads and skills properly"""
        print(f"DEBUG: UserSerializer update called with validated_data: {validated_data}")
        
        # Handle image field separately if it exists in the request
        image = validated_data.pop('image', None)
        
        # Handle skills separately
        skill_names = validated_data.pop('skill_names', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle image upload if provided
        if image is not None:
            print(f"DEBUG: Updating image field with: {image}")
            instance.image = image
        
        # Handle skills update if provided
        if skill_names is not None:
            print(f"DEBUG: Updating skills with: {skill_names}")
            # Clear existing skills
            instance.skills.clear()
            
            # Add new skills
            for skill_name in skill_names:
                skill_name = skill_name.strip()
                if skill_name:  # Only add non-empty skill names
                    skill, created = Skill.objects.get_or_create(name=skill_name)
                    instance.skills.add(skill)
                    if created:
                        print(f"DEBUG: Created new skill: {skill_name}")
        
        instance.save()
        return instance

class UserCreationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'role', 'domain', 'year']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        if not value:
            raise serializers.ValidationError("Role is required.")
        return value

    def validate_domain(self, value):
        if not value:
            raise serializers.ValidationError("Domain is required.")
        return value

    def validate_year(self, value):
        if not value:
            raise serializers.ValidationError("Graduation year is required.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user