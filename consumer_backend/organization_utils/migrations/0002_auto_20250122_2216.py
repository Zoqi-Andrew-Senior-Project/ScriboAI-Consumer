# Generated by Django 3.1.12 on 2025-01-22 22:16

from django.db import migrations
import organization_utils.models


class Migration(migrations.Migration):

    dependencies = [
        ('organization_utils', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='user_name',
            field=organization_utils.models.FullNameField(default='default_username', max_length=255, unique=True),
            preserve_default=False,
        ),
    ]
