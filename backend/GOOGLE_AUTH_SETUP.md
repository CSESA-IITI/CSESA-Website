# Google OAuth Authentication Setup Guide

## Overview
This project now includes Google OAuth authentication with organization-based access control and role-based permissions. Only users from your specified organization domain can authenticate and access the system.

## Features
- ✅ Google OAuth 2.0 authentication
- ✅ Organization domain restriction
- ✅ Role-based permissions (President, Domain Head, Coordinator, Associate)
- ✅ JWT token generation for API access
- ✅ Automatic user creation with default Associate role
- ✅ Organization validation middleware

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Configure the two required fields:

   **Authorized JavaScript origins:**
   - `http://localhost:8000` (for development)
   - `https://yourdomain.com` (for production)
   
   **Authorized redirect URIs:**
   - `http://localhost:8000/accounts/google/login/callback/` (for development)
   - `https://yourdomain.com/accounts/google/login/callback/` (for production)

7. Copy the Client ID and Client Secret

### 2. Django Settings Configuration

Update your `settings.py` with your Google OAuth credentials:

```python
# Google OAuth Settings
GOOGLE_OAUTH2_CLIENT_ID = "your-google-client-id.googleusercontent.com"
GOOGLE_OAUTH2_CLIENT_SECRET = "your-google-client-secret"

# Organization domain restriction (replace with your organization's domain)
ALLOWED_ORGANIZATION_DOMAIN = "https://www.iiti.ac.in/"
```

### 3. Database Migration

The migrations should already be applied, but if needed:

```bash
python manage.py makemigrations
python manage.py migrate
```

## API Endpoints

### Authentication Endpoints

#### 1. Google OAuth Login
**POST** `/api/auth/google/oauth/`

**Request Body:**
```json
{
    "access_token": "google-access-token-from-frontend"
}
```

**Success Response (200):**
```json
{
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "user": {
        "id": 1,
        "email": "user@your-organization.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "ASSOCIATE",
        "is_onboarded": false
    }
}
```

**Error Responses:**
- `400`: Missing or invalid Google token
- `403`: User not from allowed organization domain
- `401`: Invalid Google token

#### 2. User Profile
**GET** `/api/auth/profile/`

**Headers:**
```
Authorization: Bearer <jwt-access-token>
```

**Success Response (200):**
```json
{
    "id": 1,
    "email": "user@your-organization.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "ASSOCIATE",
    "branch": "CSE",
    "admission_year": "2023",
    "skills": "Python, Django, React",
    "github_link": "https://github.com/username",
    "linkedin_link": "https://linkedin.com/in/username",
    "instagram_link": "https://instagram.com/username",
    "is_onboarded": true
}
```

## Role-Based Permissions

### Available Roles
1. **PRESIDENT** - Highest level access
2. **DOMAIN_HEAD** - Domain-specific leadership access
3. **COORDINATOR** - Project coordination access
4. **ASSOCIATE** - Basic member access (default for new users)

### Permission Classes
Use these permission classes in your views:

```python
from users.permissions import (
    IsOrganizationMember,
    IsPresident,
    IsDomainHead,
    IsCoordinator,
    IsAssociate,
    IsPresidentOrDomainHead,
    IsLeadershipRole,
    IsOwnerOrReadOnly,
    IsOwnerOrLeadership
)

# Example usage in views
class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOrganizationMember, IsLeadershipRole]
    
class UserProfileView(APIView):
    permission_classes = [IsOrganizationMember]
```

## Frontend Integration Example

### HTML with Google Sign-In Button

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSESA Login</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <div id="g_id_onload"
         data-client_id="your-google-client-id.googleusercontent.com"
         data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin" data-type="standard"></div>

    <script>
        function handleCredentialResponse(response) {
            // Send the credential to your backend
            fetch('/api/auth/google/oauth/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    'access_token': response.credential
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    // Store the JWT token
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    
                    // Redirect to dashboard or update UI
                    window.location.href = '/dashboard/';
                } else {
                    console.error('Authentication failed:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    </script>
</body>
</html>
```

### JavaScript API Calls with JWT

```javascript
// Function to make authenticated API calls
function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
    
    return fetch(url, { ...defaultOptions, ...options });
}

// Example: Get user profile
makeAuthenticatedRequest('/api/auth/profile/')
    .then(response => response.json())
    .then(data => {
        console.log('User profile:', data);
    });

// Example: Create a project (requires leadership role)
makeAuthenticatedRequest('/api/projects/', {
    method: 'POST',
    body: JSON.stringify({
        name: 'New Project',
        description: 'Project description'
    })
})
.then(response => response.json())
.then(data => {
    console.log('Project created:', data);
});
```

## Security Features

### Organization Domain Validation
- Only users with email addresses from your specified domain can authenticate
- Domain validation happens both during OAuth callback and on every authenticated request
- Configurable via `ALLOWED_ORGANIZATION_DOMAIN` setting

### Middleware Protection
- `OrganizationValidationMiddleware` validates organization membership on every request
- Automatically blocks users who don't belong to the allowed domain
- Skips validation for authentication endpoints and admin pages

### Role-Based Access Control
- Hierarchical permission system with four distinct roles
- Granular permission classes for different access levels
- Object-level permissions for resource ownership

## Testing the Authentication

1. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

2. **Test the Google OAuth endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/google/oauth/ \
        -H "Content-Type: application/json" \
        -d '{"access_token": "valid-google-access-token"}'
   ```

3. **Test authenticated endpoints:**
   ```bash
   curl -X GET http://localhost:8000/api/auth/profile/ \
        -H "Authorization: Bearer your-jwt-token"
   ```

## Troubleshooting

### Common Issues

1. **"Only users from domain are allowed"**
   - Check that `ALLOWED_ORGANIZATION_DOMAIN` is set correctly
   - Ensure the user's Google account email matches the domain

2. **"Invalid Google token"**
   - Verify the Google access token is valid and not expired
   - Check Google Cloud Console credentials configuration

3. **"Authentication required"**
   - Ensure JWT token is included in Authorization header
   - Check if token has expired (refresh if needed)

### Environment Variables
For production, use environment variables:

```python
import os

GOOGLE_OAUTH2_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
ALLOWED_ORGANIZATION_DOMAIN = os.getenv('ORGANIZATION_DOMAIN')
```

## Next Steps

1. Configure your Google Cloud Console with the correct credentials
2. Update the `ALLOWED_ORGANIZATION_DOMAIN` setting with your organization's domain
3. Test the authentication flow with users from your organization
4. Implement role-based access control in your views using the provided permission classes
5. Create a frontend interface for user authentication and profile management

The authentication system is now ready for use! Users from your organization can authenticate via Google OAuth and will be assigned appropriate roles and permissions based on your business logic.
