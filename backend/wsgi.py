"""
WSGI config for Render deployment
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'csesa_backend.production_settings')

application = get_wsgi_application()