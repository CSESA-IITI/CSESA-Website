# Google OAuth 400 Error Troubleshooting Guide

## Current Error: "Failed to load resource: the server responded with a status of 400"

This error typically occurs due to Google Cloud Console configuration issues. Let's fix this step by step.

## Step 1: Verify Google Cloud Console Configuration

### Check Your OAuth 2.0 Client Settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Verify these exact settings:

**Application type:** Web application

**Authorized JavaScript origins:**
```
http://localhost:8000
```
(No trailing slash, no path)

**Authorized redirect URIs:**
```
http://localhost:8000/accounts/google/login/callback/
```
(With trailing slash and full path)

## Step 2: Enable Required APIs

Make sure these APIs are enabled in your Google Cloud project:

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** (or People API)
   - **Google OAuth2 API**

## Step 3: Check OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Make sure you have:
   - **User Type**: External (for testing) or Internal (if using Google Workspace)
   - **Application name**: Your app name
   - **Authorized domains**: Add `localhost` for testing

## Step 4: Test with Minimal Configuration

Let's create a minimal test to isolate the issue:

### Simple Test HTML (test_oauth.html):
```html
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Test</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <h1>Google OAuth Test</h1>
    
    <div id="g_id_onload"
         data-client_id="839760133256-tmsv6s42s19b9a7f8hc15h69564rmhud.apps.googleusercontent.com"
         data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin"></div>

    <script>
        function handleCredentialResponse(response) {
            console.log("Encoded JWT ID token: " + response.credential);
            
            // Decode the JWT token to see user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            console.log("User info:", payload);
            
            document.getElementById('result').innerHTML = 
                '<h3>Success!</h3>' +
                '<p>Email: ' + payload.email + '</p>' +
                '<p>Name: ' + payload.name + '</p>';
        }
    </script>
    
    <div id="result"></div>
</body>
</html>
```

## Step 5: Common Issues and Solutions

### Issue 1: "redirect_uri_mismatch"
**Solution:** Make sure your redirect URI in Google Console exactly matches:
`http://localhost:8000/accounts/google/login/callback/`

### Issue 2: "invalid_client"
**Solution:** 
- Double-check your Client ID is correct
- Make sure the OAuth client is for "Web application" type

### Issue 3: "access_blocked"
**Solution:**
- Add your test email to test users in OAuth consent screen
- Or set OAuth consent screen to "External" for testing

### Issue 4: "origin_mismatch"
**Solution:**
- Add `http://localhost:8000` to Authorized JavaScript origins
- Make sure there's no trailing slash

## Step 6: Alternative Approach - Use Django Allauth URLs

Instead of custom implementation, let's also set up the standard Django Allauth flow:

### Update your main URLs to include allauth:
```python
# In csesa_backend/urls.py
from django.urls import path, include

urlpatterns = [
    # ... your existing URLs
    path('accounts/', include('allauth.urls')),
]
```

### Test the standard flow:
1. Start your Django server: `python manage.py runserver`
2. Visit: `http://localhost:8000/accounts/google/login/`
3. This should redirect to Google OAuth

## Step 7: Debug Information

### Check Browser Developer Tools:
1. Open browser developer tools (F12)
2. Go to **Network** tab
3. Try to sign in and look for failed requests
4. Check the **Console** tab for JavaScript errors

### Common Console Errors:
- `Invalid client_id`: Your client ID is wrong
- `redirect_uri_mismatch`: Redirect URI doesn't match Google Console
- `origin_mismatch`: JavaScript origin doesn't match Google Console

## Step 8: Testing Checklist

- [ ] Google Cloud project has OAuth consent screen configured
- [ ] Required APIs are enabled (Google+ API, OAuth2 API)
- [ ] OAuth 2.0 Client ID is created with correct type (Web application)
- [ ] JavaScript origins include `http://localhost:8000`
- [ ] Redirect URIs include `http://localhost:8000/accounts/google/login/callback/`
- [ ] Client ID and secret are correctly copied to Django settings
- [ ] Django server is running on port 8000
- [ ] Testing from `http://localhost:8000` (not file:// or different port)

## Next Steps

1. First, verify all the Google Cloud Console settings above
2. Try the minimal test HTML file
3. If that works, the issue is in our Django integration
4. If it doesn't work, the issue is in Google Cloud Console configuration

Let me know what you find and I'll help you proceed with the next steps!
