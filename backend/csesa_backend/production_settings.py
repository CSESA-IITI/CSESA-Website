"""
Production settings for PythonAnywhere deployment
"""
import os
from .settings import *

DEBUG = False

ALLOWED_HOSTS = [
    'youruserid.pythonanywhere.com',  
    'localhost',
    '127.0.0.1'
]

# CORS settings for production - Update with your Vercel domain
CORS_ALLOWED_ORIGINS = [
    'https://your-app-name.vercel.app',  # Replace with your actual Vercel domain
    'http://localhost:5173',  # Keep for local development
    'http://localhost:5174',
]

CORS_ORIGIN_WHITELIST = [
    'https://your-app-name.vercel.app',  # Replace with your actual Vercel domain
]

# Database - PythonAnywhere uses MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'yourusername$csesa_db',  # Replace with your database name
        'USER': 'yourusername',  # Replace with your PythonAnywhere username
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),  # Set this in PythonAnywhere console
        'HOST': 'yourusername.mysql.pythonanywhere-services.com',  # Replace with your username
        'PORT': '3306',
    }
}

# Static files settings for production
STATIC_URL = '/static/'
STATIC_ROOT = '/home/youruserid/csesa-backend/static'  # Replace with your username

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/youruserid/csesa-backend/media'  # Replace with your username

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Use environment variable for secret key in production
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)