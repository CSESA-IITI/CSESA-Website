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
    team_members = models.ManyToManyField(CustomUser, related_name='projects', blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_projects', null=True, blank=True)
    github_link = models.URLField()
    deployment_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def add_contributor(self, user):
        """Add a user as a contributor to the project"""
        if not self.team_members.filter(id=user.id).exists():
            self.team_members.add(user)
            return True
        return False

    def remove_contributor(self, user):
        """Remove a user from project contributors"""
        if self.team_members.filter(id=user.id).exists():
            self.team_members.remove(user)
            return True
        return False

    def can_manage_contributors(self, user):
        """Check if user can manage project contributors"""
        # Handle None or unauthenticated users
        if not user or not user.is_authenticated:
            return False
        
        # Project creator can always manage contributors
        if self.created_by == user:
            return True
        
        # Presidents, Domain Heads, and Coordinators can manage contributors
        if user.role in [CustomUser.Role.PRESIDENT, CustomUser.Role.HEAD, CustomUser.Role.COORDINATOR]:
            return True
        
        return False

    class Meta:
        indexes = [
            models.Index(fields=['created_by']),
        ]