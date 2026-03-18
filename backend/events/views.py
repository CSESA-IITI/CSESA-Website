# events/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event
from .serializers import EventSerializer
from users.permissions import CanManageEvents

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        """
        Allow unauthenticated read access (list, retrieve).
        Require authentication and permissions for write operations.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageEvents()]

    def perform_create(self, serializer):
        """Set the created_by field to the current user when creating an event"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_events(self, request):
        """
        Return events created by the current user.
        """
        user_events = Event.objects.filter(created_by=request.user)
        serializer = self.get_serializer(user_events, many=True)
        return Response(serializer.data)