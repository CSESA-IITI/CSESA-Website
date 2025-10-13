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

# Serializer for bulk contributor management operations
class ContributorManagementSerializer(serializers.Serializer):
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of user IDs to add or remove as contributors"
    )
    action = serializers.ChoiceField(
        choices=['add', 'remove'],
        help_text="Action to perform: 'add' or 'remove' contributors"
    )

    def validate_user_ids(self, value):
        """Validate that all user IDs exist"""
        if not value:
            raise serializers.ValidationError("At least one user ID is required.")
        
        # Check if all user IDs exist
        existing_user_ids = set(CustomUser.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = set(value) - existing_user_ids
        
        if invalid_ids:
            raise serializers.ValidationError(f"Invalid user IDs: {list(invalid_ids)}")
        
        return value

# Main serializer for the Project model
class ProjectSerializer(serializers.ModelSerializer):
    # These read-only fields provide detailed info in GET responses
    domains_details = DomainSerializer(many=True, read_only=True, source='domains')
    team_members_details = ProjectMemberSerializer(many=True, read_only=True, source='team_members')
    
    # New field for automatic self-assignment during project creation
    add_self_as_contributor = serializers.BooleanField(write_only=True, default=True)
    
    # Method field to return available contributors
    available_contributors = serializers.SerializerMethodField()

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
            'created_by',
            'domains', # This field is for writing (accepting a list of domain IDs)
            'domains_details', # This field is for reading (showing full domain details)
            'team_members', # This field is for writing (accepting a list of user IDs)
            'team_members_details', # This field is for reading (showing user details)
            'add_self_as_contributor', # New field for self-assignment
            'available_contributors', # New field for available users
        ]
        # These fields will accept a list of Primary Keys (IDs) during POST/PUT requests
        extra_kwargs = {
            'domains': {'write_only': True},
            'team_members': {'write_only': True, 'required': False},  # Make team_members optional
            'created_by': {'read_only': True},
        }

    def get_available_contributors(self, obj):
        """Return users who can be added as contributors"""
        if obj and obj.pk:
            # For existing projects, exclude current team members
            current_member_ids = obj.team_members.values_list('id', flat=True)
            available_users = CustomUser.objects.exclude(id__in=current_member_ids)
        else:
            # For new projects, return all users
            available_users = CustomUser.objects.all()
        
        return ProjectMemberSerializer(available_users, many=True).data

    def create(self, validated_data):
        """Handle project creation with automatic self-assignment"""
        # Extract the add_self_as_contributor flag
        add_self_as_contributor = validated_data.pop('add_self_as_contributor', True)
        
        # Get the current user from the request context
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            current_user = request.user
            # Set the created_by field
            validated_data['created_by'] = current_user
        else:
            current_user = None

        # Extract many-to-many fields for later processing
        team_members = validated_data.pop('team_members', [])
        domains = validated_data.pop('domains', [])

        # Create the project
        project = Project.objects.create(**validated_data)

        # Set many-to-many relationships
        if domains:
            project.domains.set(domains)
        
        if team_members:
            project.team_members.set(team_members)

        # Add current user as contributor if flag is True and user exists
        if add_self_as_contributor and current_user and current_user.is_authenticated:
            project.add_contributor(current_user)

        return project