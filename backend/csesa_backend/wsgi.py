"""
WSGI config for csesa_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys

path = '/home/yourusername/your-repo-name/backend'
if path not in sys.path:
   sys.path.insert(0, path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'csesa_backend.production_settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
