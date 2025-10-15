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
        
        # Check if user exists
        existing_user = User.objects.filter(email=email).first()
        
        if existing_user:
            # Check if the existing user has an unusable password
            if not existing_user.has_usable_password():
                self.stdout.write(
                    self.style.WARNING(f'Superuser {email} exists but has unusable password. Updating password...')
                )
                existing_user.set_password(password)
                existing_user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Superuser {email} password updated successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Superuser {email} already exists with usable password')
                )
            return
        
        # Create new superuser
        User.objects.create_superuser(
            email=email,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Superuser {email} created successfully')
        )