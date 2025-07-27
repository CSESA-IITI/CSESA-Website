from django.db import models
from users.models import CustomUser

class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.CharField(max_length=500, help_text="Comma-separated technologies")
    domains = models.ManyToManyField(Domain, related_name='projects')
    team_members = models.ManyToManyField(CustomUser, related_name='projects')
    github_link = models.URLField()
    deployment_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name