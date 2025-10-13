# projects/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Project, Domain
from .serializers import ProjectSerializer, DomainSerializer, ContributorManagementSerializer, ProjectMemberSerializer
from users.permissions import (
    IsPresident, IsDomainHead, IsCoordinator, 
    CanManageProjectContributors, CanViewProjectContributors
)
from users.models import CustomUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsPresident | IsDomainHead | IsCoordinator]
        elif self.action == 'manage_contributors':
            self.permission_classes = [CanManageProjectContributors]
        elif self.action == 'available_contributors':
            self.permission_classes = [CanManageProjectContributors]
        return super().get_permissions()

    @action(detail=True, methods=['post'], url_path='contributors')
    def manage_contributors(self, request, pk=None):
        """
        Add or remove contributors from a project.
        Expects: {"user_ids": [1, 2, 3], "action": "add" or "remove"}
        """
        project = self.get_object()
        
        # Permission is handled by CanManageProjectContributors permission class
        
        serializer = ContributorManagementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_ids = serializer.validated_data['user_ids']
        action_type = serializer.validated_data['action']
        
        # Get users to add/remove
        users = CustomUser.objects.filter(id__in=user_ids)
        
        results = []
        for user in users:
            if action_type == 'add':
                success = project.add_contributor(user)
                results.append({
                    'user_id': user.id,
                    'user_name': f"{user.first_name} {user.last_name}",
                    'action': 'added',
                    'success': success,
                    'message': 'User added successfully' if success else 'User is already a contributor'
                })
            elif action_type == 'remove':
                success = project.remove_contributor(user)
                results.append({
                    'user_id': user.id,
                    'user_name': f"{user.first_name} {user.last_name}",
                    'action': 'removed',
                    'success': success,
                    'message': 'User removed successfully' if success else 'User was not a contributor'
                })
        
        # Return updated project data
        project.refresh_from_db()
        return Response({
            'message': f'Contributors {action_type} operation completed',
            'results': results,
            'current_contributors': ProjectMemberSerializer(project.team_members.all(), many=True).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='available-contributors')
    def available_contributors(self, request, pk=None):
        """
        Get list of users who can be added as contributors to this project.
        Excludes current team members.
        """
        project = self.get_object()
        
        # Permission is handled by CanManageProjectContributors permission class
        
        # Get users who are not already contributors
        current_member_ids = project.team_members.values_list('id', flat=True)
        available_users = CustomUser.objects.exclude(id__in=current_member_ids).order_by('first_name', 'last_name')
        
        serializer = ProjectMemberSerializer(available_users, many=True)
        return Response({
            'available_contributors': serializer.data,
            'count': available_users.count()
        }, status=status.HTTP_200_OK)

class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [IsPresident] # Only President can manage domains