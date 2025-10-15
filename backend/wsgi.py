"""
WSGI config for PythonAnywhere deployment
"""
import os
import sys

# Add your project directory to the sys.path
path = '/home/abhishek1911/csesa-backend'  
if path not in sys.path:
    sys.path.insert(0, path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'csesa_backend.production_settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()