from django.core.management.base import BaseCommand
from projects.models import Domain

class Command(BaseCommand):
    help = 'Create default domains for projects'

    def handle(self, *args, **options):
        default_domains = [
            {'id': 1, 'name': 'General'},
            {'id': 2, 'name': 'Web Development'},
            {'id': 3, 'name': 'Systems Programming'},
            {'id': 4, 'name': 'Data Science'},
            {'id': 5, 'name': 'Machine Learning'},
        ]
        
        for domain_data in default_domains:
            domain, created = Domain.objects.get_or_create(
                id=domain_data['id'],
                defaults={'name': domain_data['name']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created domain: {domain.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Domain already exists: {domain.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Default domains setup completed')
        )