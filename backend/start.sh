#!/usr/bin/env bash

# Get port from environment or default to 8000
PORT=${PORT:-8000}

# Run database migrations
python manage.py migrate

# Create superuser if environment variables are set
python manage.py create_superuser

# Create default domain
python manage.py create_default_domain

# Start gunicorn with proper port binding
exec gunicorn csesa_backend.wsgi:application --bind 0.0.0.0:$PORT