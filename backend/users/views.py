from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer
from .permissions import IsPresident, IsDomainHead
import re

from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


# This view is still useful for Associates to update their profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# This view is still useful for the President to manage roles
class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('first_name')
    permission_classes = [IsPresident]
    serializer_class = UserSerializer