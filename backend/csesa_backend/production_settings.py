"""
Production settings for Render deployment
"""
import os
import dj_database_url
from .settings import *

DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',  # Allow all Render subdomains
]

# CORS settings for production - Update with your Vercel domain
# CORS settings for production - configurable via environment variables
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://csesa-website-pi.vercel.app')

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    'http://localhost:5173',  # Keep for local development
    'http://localhost:5174',
]

CORS_ORIGIN_WHITELIST = [
    FRONTEND_URL,
]

# Allow all origins if CORS_ALLOW_ALL is set to 'true'
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL', 'false').lower() == 'true'

CORS_ALLOW_CREDENTIALS = True

# Database - Use SQLite for now (Python 3.13 compatibility)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files configuration for Render
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add WhiteNoise for static file serving
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS settings (Render provides HTTPS automatically)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Use environment variable for secret key in production
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)