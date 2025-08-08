# users/models.py
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.core.exceptions import ValidationError


class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'domains'

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    can_manage_events = models.BooleanField(default=False)
    can_manage_projects = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'roles'

class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        # Get or create President role for superuser
        president_role, created = Role.objects.get_or_create(
            name='President',
            defaults={
                'can_manage_events': True,
                'can_manage_projects': True
            }
        )
        extra_fields['role'] = president_role
        
        # Set name if not provided
        if 'name' not in extra_fields:
            extra_fields['name'] = username
            
        return self._create_user(username, email, password, **extra_fields)

    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        if extra_fields.get('is_staff') is not False:
            raise ValueError('User must have is_staff=False.')
        if extra_fields.get('is_superuser') is not False:
            raise ValueError('User must have is_superuser=False.')
        
        return self._create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    domain = models.ForeignKey(Domain, on_delete=models.PROTECT, null=True, blank=True)
    batch = models.CharField(max_length=20, blank=True)
    github_link = models.URLField(max_length=500, blank=True)
    instagram_link = models.URLField(max_length=500, blank=True)
    linkedin_link = models.URLField(max_length=500, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True)
    skills = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    def clean(self):
        super().clean()
        # Skip validation for superusers during creation
        if self.is_superuser and not self.role:
            return
        if self.role and self.role.name != 'President' and not self.domain:
            raise ValidationError('Domain is required for all roles except President')

    def save(self, *args, **kwargs):
        # Skip full_clean for superuser creation
        if not (self.is_superuser and not self.role):
            self.full_clean()
        super().save(*args, **kwargs)

    def can_manage_content(self):
        if not self.role:
            return self.is_superuser
        return self.role.can_manage_events or self.role.can_manage_projects

    def __str__(self):
        role_name = self.role.name if self.role else 'No Role'
        return f"{self.name} ({role_name})"

    class Meta:
        db_table = 'users'