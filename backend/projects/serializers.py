from rest_framework import serializers
from .models import Domain, Project
from users.models import CustomUser

# A simple serializer for Domain names
class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'name']

# A lightweight serializer to represent team members within a project response
class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

# Main serializer for the Project model
class ProjectSerializer(serializers.ModelSerializer):
    # These read-only fields provide detailed info in GET responses
    domains_details = DomainSerializer(many=True, read_only=True, source='domains')
    team_members_details = ProjectMemberSerializer(many=True, read_only=True, source='team_members')

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'tech_stack',
            'github_link',
            'deployment_link',
            'created_at',
            'updated_at',
            'domains', # This field is for writing (accepting a list of domain IDs)
            'domains_details', # This field is for reading (showing full domain details)
            'team_members', # This field is for writing (accepting a list of user IDs)
            'team_members_details', # This field is for reading (showing user details)
        ]
        # These fields will accept a list of Primary Keys (IDs) during POST/PUT requests
        extra_kwargs = {
            'domains': {'write_only': True},
            'team_members': {'write_only': True}
        }