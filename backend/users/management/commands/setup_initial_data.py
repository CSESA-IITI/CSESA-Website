from django.core.management.base import BaseCommand
from users.models import Domain, Role

class Command(BaseCommand):
    help = 'Setup initial domains and roles'

    def handle(self, *args, **options):
        # Create Domains
        domains_data = [
            ('Web Development', 'Frontend and backend web technologies'),
            ('System Programming', 'Low-level programming and system design'),
            ('Graphical Programming', 'Graphics, UI/UX, and visual programming'),
            ('AI/ML', 'Artificial Intelligence and Machine Learning'),
            ('Competitive Programming', 'Algorithmic problem solving and contests'),
        ]

        for name, description in domains_data:
            domain, created = Domain.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(f'Created domain: {name}')

        # Create Roles
        roles_data = [
            ('President', True, True),
            ('Domain Head', True, True),
            ('Coordinator', False, False),
            ('Associate', False, False),
        ]

        for name, can_manage_events, can_manage_projects in roles_data:
            role, created = Role.objects.get_or_create(
                name=name,
                defaults={
                    'can_manage_events': can_manage_events,
                    'can_manage_projects': can_manage_projects
                }
            )
            if created:
                self.stdout.write(f'Created role: {name}')

        self.stdout.write(self.style.SUCCESS('Successfully set up initial data'))
