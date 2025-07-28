from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings

class GoogleSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        if not user.email.endswith(f"@{settings.ALLOWED_ORGANIZATION_DOMAIN}"):
            raise ValueError("Only users from the allowed organization can log in.")
