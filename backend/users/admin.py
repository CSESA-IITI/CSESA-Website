
# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Domain, Role

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'can_manage_events', 'can_manage_projects']

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['name', 'email', 'role', 'domain', 'batch', 'is_active']
    list_filter = ['role', 'domain', 'batch', 'is_active']
    search_fields = ['name', 'email', 'username']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('name', 'role', 'domain', 'batch', 'github_link', 
                      'instagram_link', 'linkedin_link', 'profile_pic', 'skills')
        }),
    )