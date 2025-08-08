# projects/models.py
from django.db import models
from users.models import User, Domain

class Project(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    name = models.CharField(max_length=255)
    description_short = models.TextField()
    description_long = models.TextField(blank=True)
    tech_stack = models.JSONField(default=list)
    github_link = models.URLField(max_length=500, blank=True)
    deployment_link = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    image = models.ImageField(upload_to='project_images/', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_projects')
    domains = models.ManyToManyField(Domain, through='ProjectDomain')
    team_members = models.ManyToManyField(User, through='ProjectTeamMember', related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'projects'

class ProjectDomain(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)

    class Meta:
        db_table = 'project_domains'
        unique_together = ['project', 'domain']

class ProjectTeamMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role_in_project = models.CharField(max_length=100, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_team_members'
        unique_together = ['project', 'user']
