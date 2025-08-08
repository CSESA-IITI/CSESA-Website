# events/views.py
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Event
from .serializers import EventSerializer

class CanManageEventPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.can_manage_content()

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.select_related('created_by').all()
    serializer_class = EventSerializer
    permission_classes = [CanManageEventPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related('created_by').all()
    serializer_class = EventSerializer
    permission_classes = [CanManageEventPermission]

    def perform_update(self, serializer):
        if not self.request.user.can_manage_content():
            raise PermissionDenied("You don't have permission to update events")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.can_manage_content():
            raise PermissionDenied("You don't have permission to delete events")
        instance.delete()
