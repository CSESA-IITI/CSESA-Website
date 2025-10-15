#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser if environment variables are set
python manage.py create_superuser

# Make start script executable
chmod +x start.sh