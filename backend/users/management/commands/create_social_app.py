from django.core.management.base import BaseCommand
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates a SocialApp for Google.'

    def handle(self, *args, **options):
        site = Site.objects.get_current()
        if SocialApp.objects.filter(provider='google', sites=site).exists():
            self.stdout.write(self.style.SUCCESS('SocialApp for Google already exists.'))
            return

        app = SocialApp.objects.create(
            provider='google',
            name='Google',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        )
        app.sites.add(site)
        self.stdout.write(self.style.SUCCESS('Successfully created SocialApp for Google.'))
