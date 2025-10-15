from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser from environment variables'

    def handle(self, *args, **options):
        email = os.environ.get('SUPERUSER_EMAIL', 'admin@csesa.com')
        password = os.environ.get('SUPERUSER_PASSWORD')
        
        if not password:
            self.stdout.write(
                self.style.ERROR('SUPERUSER_PASSWORD environment variable is required')
            )
            return
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser {email} already exists')
            )
            return
        
        User.objects.create_superuser(
            email=email,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Superuser {email} created successfully')
        )