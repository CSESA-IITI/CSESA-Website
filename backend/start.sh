#!/usr/bin/env bash

# Get port from environment or default to 8000
PORT=${PORT:-8000}

# Start gunicorn with proper port binding
exec gunicorn csesa_backend.wsgi:application --bind 0.0.0.0:$PORT