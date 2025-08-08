# projects/views.py
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Project
from .serializers import ProjectSerializer

class CanManageProjectPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.can_manage_content()

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.select_related('created_by').prefetch_related('domains', 'team_members').all()
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProjectPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.select_related('created_by').prefetch_related('domains', 'team_members').all()
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProjectPermission]

    def perform_update(self, serializer):
        if not self.request.user.can_manage_content():
            raise PermissionDenied("You don't have permission to update projects")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.can_manage_content():
            raise PermissionDenied("You don't have permission to delete projects")
        instance.delete()
