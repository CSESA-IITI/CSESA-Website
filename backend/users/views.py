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


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # The frontend sends the Google ID token
            token = request.data.get('token')
            
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            email = idinfo['email']
            
            # Check for institutional email
            if not email.endswith('@iiti.ac.in'):
                return Response({'error': 'Only IITI institutional accounts are allowed.'}, status=status.HTTP_403_FORBIDDEN)

            # --- Onboarding and Login Logic ---
            try:
                user = CustomUser.objects.get(email=email)
                # User already exists, log them in
                
            except CustomUser.DoesNotExist:
                # First user ever? Make them President.
                if CustomUser.objects.count() == 0:
                    # Parse email for branch and year
                    match = re.match(r"([a-z]+)(\d{2})\d{5}@iiti\.ac\.in", email)
                    branch = match.group(1).upper() if match else ''
                    admission_year = "20" + match.group(2) if match else ''

                    user = CustomUser.objects.create_user(
                        email=email,
                        first_name=idinfo.get('given_name', ''),
                        last_name=idinfo.get('family_name', ''),
                        role=CustomUser.Role.PRESIDENT,
                        branch=branch,
                        admission_year=admission_year,
                        is_onboarded=True, # President is onboarded by default
                        is_staff=True, # President can access admin panel
                    )
                else:
                    # If user doesn't exist and is not the first, they can't log in
                    return Response({'error': 'Account not found. Please ask a President or Domain Head to add you.'}, status=status.HTTP_404_NOT_FOUND)
            
            # Generate JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })

        except ValueError:
            # Invalid token
            return Response({'error': 'Invalid Google token.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InviteUserView(generics.CreateAPIView):
    """
    An endpoint for Presidents and Domain Heads to add new users to the system.
    """
    permission_classes = [IsPresident | IsDomainHead]
    serializer_class = UserSerializer # We can reuse this for input validation

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        role = request.data.get('role')

        if not email or not role:
            return Response({'error': 'Email and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for institutional email
        if not email.endswith('@iiti.ac.in'):
            return Response({'error': 'Only IITI institutional accounts are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent Domain Heads from creating Presidents or other Domain Heads
        if request.user.role == CustomUser.Role.DOMAIN_HEAD and role in [CustomUser.Role.PRESIDENT, CustomUser.Role.DOMAIN_HEAD]:
            return Response({'error': 'You do not have permission to create users with this role.'}, status=status.HTTP_403_FORBIDDEN)
        
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse email
        match = re.match(r"([a-z]+)(\d{2})\d{5}@iiti\.ac\.in", email)
        branch = match.group(1).upper() if match else ''
        admission_year = "20" + match.group(2) if match else ''
        
        # Create a new, inactive user who can now log in via Google
        new_user = CustomUser.objects.create_user(
            email=email,
            role=role,
            branch=branch,
            admission_year=admission_year
        )
        
        return Response(UserSerializer(new_user).data, status=status.HTTP_201_CREATED)

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