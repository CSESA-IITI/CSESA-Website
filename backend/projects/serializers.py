# projects/serializers.py
from rest_framework import serializers
from .models import Project, ProjectTeamMember
from users.serializers import UserSerializer, DomainSerializer

class ProjectTeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProjectTeamMember
        fields = ['user', 'user_id', 'role_in_project', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    domains_data = DomainSerializer(source='domains', many=True, read_only=True)
    domain_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    team_members_data = ProjectTeamMemberSerializer(source='projectteammember_set', many=True, read_only=True)
    team_member_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    created_by_data = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description_short', 'description_long', 'tech_stack',
            'github_link', 'deployment_link', 'status', 'image', 'created_by',
            'created_by_data', 'domains_data', 'domain_ids', 'team_members_data',
            'team_member_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        domain_ids = validated_data.pop('domain_ids')
        team_member_ids = validated_data.pop('team_member_ids', [])
        
        project = Project.objects.create(**validated_data)
        project.domains.set(domain_ids)
        
        for user_id in team_member_ids:
            ProjectTeamMember.objects.create(project=project, user_id=user_id)
        
        return project

    def update(self, instance, validated_data):
        domain_ids = validated_data.pop('domain_ids', None)
        team_member_ids = validated_data.pop('team_member_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if domain_ids is not None:
            instance.domains.set(domain_ids)
        
        if team_member_ids is not None:
            instance.projectteammember_set.all().delete()
            for user_id in team_member_ids:
                ProjectTeamMember.objects.create(project=instance, user_id=user_id)
        
        return instance