# Generated migration to set created_by field for existing projects

from django.db import migrations
from django.contrib.auth import get_user_model

def set_created_by_for_existing_projects(apps, schema_editor):
    """
    Set created_by field for existing projects that don't have it set.
    This ensures backward compatibility with projects created before the created_by field was added.
    """
    Project = apps.get_model('projects', 'Project')
    CustomUser = get_user_model()
    
    # Get projects without created_by set
    projects_without_creator = Project.objects.filter(created_by__isnull=True)
    
    if projects_without_creator.exists():
        # Try to find a suitable default user (President or first admin user)
        default_user = None
        
        # First, try to find a President
        try:
            default_user = CustomUser.objects.filter(role='PRESIDENT').first()
        except:
            pass
        
        # If no President, try to find a Head
        if not default_user:
            try:
                default_user = CustomUser.objects.filter(role='HEAD').first()
            except:
                pass
        
        # If no Head, try to find any superuser
        if not default_user:
            try:
                default_user = CustomUser.objects.filter(is_superuser=True).first()
            except:
                pass
        
        # If no superuser, try to find any staff user
        if not default_user:
            try:
                default_user = CustomUser.objects.filter(is_staff=True).first()
            except:
                pass
        
        # If still no user, try to find the first user
        if not default_user:
            try:
                default_user = CustomUser.objects.first()
            except:
                pass
        
        # Update projects with the default user if found
        if default_user:
            projects_without_creator.update(created_by=default_user)
            print(f"Updated {projects_without_creator.count()} projects with created_by = {default_user.email}")
        else:
            print("No suitable default user found. Projects will remain with created_by = NULL")

def reverse_set_created_by(apps, schema_editor):
    """
    Reverse migration - set created_by back to NULL for projects that were updated
    """
    # We don't need to do anything here as this was a data migration
    # to fix existing data, not a schema change
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_project_created_by_alter_project_team_members_and_more'),
    ]

    operations = [
        migrations.RunPython(
            set_created_by_for_existing_projects,
            reverse_set_created_by,
        ),
    ]