# projects/admin.py
from django.contrib import admin
from .models import Project, ProjectTeamMember, ProjectDomain

class ProjectTeamMemberInline(admin.TabularInline):
    model = ProjectTeamMember
    extra = 1

class ProjectDomainInline(admin.TabularInline):
    model = ProjectDomain
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'domains', 'created_at']
    search_fields = ['name', 'description_short']
    inlines = [ProjectDomainInline, ProjectTeamMemberInline]