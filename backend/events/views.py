# events/views.py
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer
from users.permissions import IsPresident, IsDomainHead
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsPresident | IsDomainHead]
        return super().get_permissions()