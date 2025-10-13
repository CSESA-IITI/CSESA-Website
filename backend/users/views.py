from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CustomUser, Skill
from .serializers import UserSerializer, UserRegistrationSerializer, UserCreationSerializer, SkillSerializer
from .permissions import IsPresident, IsDomainHead
import re

class ObtainTokenPairWithUserDataView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = CustomUser.objects.get(email=request.data['email'])
            response.data['user'] = UserSerializer(user, context={'request': request}).data
        return response

class InviteUserView(generics.CreateAPIView):
    """
    An endpoint for Presidents and Domain Heads to add new users to the system.
    """
    permission_classes = [IsPresident | IsDomainHead]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED, headers=headers)

# This view is still useful for Associates to update their profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        print(f"DEBUG: Profile update request data: {request.data}")
        print(f"DEBUG: Request FILES: {request.FILES}")
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        print(f"DEBUG: Profile partial update request data: {request.data}")
        print(f"DEBUG: Request FILES: {request.FILES}")
        return super().partial_update(request, *args, **kwargs)

# This view is still useful for the President to manage roles
class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('first_name')
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        - Authenticated users can list and retrieve.
        - Only Presidents can create, update, or delete users.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsPresident]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        Use UserCreationSerializer for create operations to handle passwords properly.
        """
        if self.action == 'create':
            return UserCreationSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create to use UserCreationSerializer and return UserSerializer data
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return the user data using UserSerializer
        user_serializer = UserSerializer(user, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving skills.
    Users can view all available skills to select from.
    """
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]