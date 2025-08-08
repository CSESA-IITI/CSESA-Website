from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Role

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a president user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email address')
        parser.add_argument('--username', type=str, help='Username')
        parser.add_argument('--name', type=str, help='Full name')

    def handle(self, *args, **options):
        # Get or create President role
        president_role, created = Role.objects.get_or_create(
            name='President',
            defaults={
                'can_manage_events': True,
                'can_manage_projects': True
            }
        )
        
        if created:
            self.stdout.write('Created President role')

        # Get user details
        email = options.get('email') or input('Email: ')
        username = options.get('username') or input('Username: ')
        name = options.get('name') or input('Full Name: ')
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'User with email {email} already exists'))
            return
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User with username {username} already exists'))
            return

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            name=name,
            role=president_role,
            is_staff=True,
            is_superuser=True
        )
        
        # Set password
        password = input('Password: ')
        user.set_password(password)
        user.save()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created president user: {username}')
        )