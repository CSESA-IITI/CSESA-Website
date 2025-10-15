# Generated manually to fix github_link field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_set_created_by_for_existing_projects'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='github_link',
            field=models.URLField(blank=True, null=True),
        ),
    ]