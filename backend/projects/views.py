# projects/views.py
from rest_framework import viewsets
from .models import Project, Domain
from .serializers import ProjectSerializer, DomainSerializer
from users.permissions import IsPresident, IsDomainHead, IsCoordinator
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsPresident | IsDomainHead | IsCoordinator]
        return super().get_permissions()

class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [IsPresident] # Only President can manage domains