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
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', self.model.Role.PRESIDENT)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        PRESIDENT = 'PRESIDENT', 'President'
        HEAD = 'HEAD', 'Head'
        COORDINATOR = 'COORDINATOR', 'Coordinator'
        ASSOCIATE = 'ASSOCIATE', 'Associate'

    class Domain(models.TextChoices):
        COMPETITIVE_PROGRAMMING = 'COMPETITIVE_PROGRAMMING', 'Competitive Programming'
        WEB_DEVELOPMENT = 'WEB_DEVELOPMENT', 'Web Development'
        SYSTEMS_PROGRAMMING = 'SYSTEMS_PROGRAMMING', 'Systems Programming'
        GRAPHICS_PROGRAMMING = 'GRAPHICS_PROGRAMMING', 'Graphics Programming'
        MACHINE_LEARNING = 'MACHINE_LEARNING', 'Machine Learning'

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ASSOCIATE)
    domain = models.CharField(max_length=50, choices=Domain.choices, blank=True)
    year = models.CharField(max_length=4, blank=True, help_text="Graduation Year")

    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    skills = models.ManyToManyField(Skill, blank=True)
    github_link = models.URLField(blank=True)
    linkedin_link = models.URLField(blank=True)
    
    # Track if the user has completed their initial profile setup
    is_onboarded = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email