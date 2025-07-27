from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            # For OAuth users who don't have a password
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'PRESIDENT')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        PRESIDENT = 'PRESIDENT', 'President'
        DOMAIN_HEAD = 'DOMAIN_HEAD', 'Domain Head'
        COORDINATOR = 'COORDINATOR', 'Coordinator'
        ASSOCIATE = 'ASSOCIATE', 'Associate'

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ASSOCIATE)
    
    branch = models.CharField(max_length=10, blank=True)
    admission_year = models.CharField(max_length=4, blank=True)

    skills = models.TextField(blank=True, help_text="Comma-separated skills")
    github_link = models.URLField(blank=True)
    linkedin_link = models.URLField(blank=True)
    instagram_link = models.URLField(blank=True)
    
    # Google profile picture URL
    picture = models.URLField(blank=True, null=True, help_text="URL of the user's Google profile picture")
    
    # Track if the user has completed their initial profile setup
    is_onboarded = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email