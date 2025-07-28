from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
import requests

User = get_user_model()

class GoogleSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to handle Google OAuth with organization domain validation
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Validate that the user's email domain matches the allowed organization domain
        """
        user_email = sociallogin.account.extra_data.get('email', '')
        
        if not user_email:
            raise ValidationError("Email is required for authentication")
        
        # Extract domain from email
        email_domain = user_email.split('@')[-1].lower()
        allowed_domain = getattr(settings, 'ALLOWED_ORGANIZATION_DOMAIN', '').lower()
        
        if not allowed_domain:
            raise ValidationError("Organization domain not configured")
        
        if email_domain != allowed_domain:
            raise ValidationError(f"Only users from {allowed_domain} are allowed to login")
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save or get existing user with Google OAuth data
        """
        user_email = sociallogin.account.extra_data.get('email', '')
        user_name = sociallogin.account.extra_data.get('name', '')
        
        # Try to get existing user
        try:
            user = User.objects.get(email=user_email)
            # Update user info if needed
            if not user.first_name and user_name:
                name_parts = user_name.split(' ', 1)
                user.first_name = name_parts[0]
                if len(name_parts) > 1:
                    user.last_name = name_parts[1]
                user.save()
        except User.DoesNotExist:
            # Create new user
            name_parts = user_name.split(' ', 1) if user_name else ['', '']
            user = User.objects.create_user(
                email=user_email,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else '',
                role=User.Role.ASSOCIATE,  # Default role
                is_onboarded=False  # User needs to complete profile
            )
        
        return user

@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_login(request):
    """
    Initiate Google OAuth login flow
    This will return the Google OAuth URL with a state parameter
    """
    from urllib.parse import urlencode
    import json

    # Google OAuth configuration
    client_id = settings.GOOGLE_OAUTH2_CLIENT_ID
    redirect_uri = request.query_params.get('redirect_uri')
    state = request.query_params.get('state')
    scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid'

    # Build the authorization URL
    params = {
        'client_id': client_id,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': redirect_uri,
        'access_type': 'offline',
        'prompt': 'select_account',
        'state': state,
    }

    auth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}'
    return Response({'auth_url': auth_url}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_callback(request):
    """
    Handle Google OAuth callback with authorization code
    """
    import json
    try:
        code = request.data.get('code')
        state_str = request.data.get('state')
        state = json.loads(state_str)
        redirect_uri = state.get('redirect_uri')

        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Exchange authorization code for tokens
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }

        response = requests.post(token_url, data=data)
        token_data = response.json()

        if response.status_code != 200:
            return Response(
                {'error': 'Failed to exchange code for tokens', 'details': token_data},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user info using access token
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        headers = {
            'Authorization': f'Bearer {token_data["access_token"]}'
        }
        user_info_response = requests.get(user_info_url, headers=headers)

        if user_info_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch user info', 'details': user_info_response.text},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_data = user_info_response.json()
        user_email = user_data.get('email', '')
        user_name = user_data.get('name', '')

        if not user_email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate organization domain
        email_domain = user_email.split('@')[-1].lower()
        allowed_domain = getattr(settings, 'ALLOWED_ORGANIZATION_DOMAIN', '').lower()

        if not allowed_domain:
            return Response(
                {'error': 'Organization domain not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if email_domain != allowed_domain:
            return Response(
                {'error': f'Only users from {allowed_domain} are allowed to login'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get or create user
        try:
            user = User.objects.get(email=user_email)
            # Update user info if needed
            if not user.first_name and user_name:
                name_parts = user_name.split(' ', 1)
                user.first_name = name_parts[0]
                if len(name_parts) > 1:
                    user.last_name = name_parts[1]
                # Update profile picture if available from Google
                if user_data.get('picture') and not user.picture:
                    user.picture = user_data['picture']
                user.save()
        except User.DoesNotExist:
            # Create new user
            name_parts = user_name.split(' ', 1) if user_name else ['', '']
            user = User.objects.create_user(
                email=user_email,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else '',
                picture=user_data.get('picture', ''),  # Save Google profile picture
                role=User.Role.ASSOCIATE,  # Default role
                is_onboarded=False  # User needs to complete profile
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Prepare response data
        response_data = {
            'access_token': access_token,
            'refresh_token': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'picture': user.picture or user_data.get('picture', ''),  # Include profile picture
                'role': user.role,
                'is_onboarded': user.is_onboarded,
            },
            'redirect_uri': state.get('from')
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile information
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'branch': user.branch,
        'admission_year': user.admission_year,
        'skills': user.skills,
        'github_link': user.github_link,
        'linkedin_link': user.linkedin_link,
        'instagram_link': user.instagram_link,
        'is_onboarded': user.is_onboarded,
    }, status=status.HTTP_200_OK)
