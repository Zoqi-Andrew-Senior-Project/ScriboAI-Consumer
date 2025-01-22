# Generated by Django 3.1.12 on 2025-01-22 06:50

import course_utils.models
from django.db import migrations, models
import django.db.models.deletion
import djongo.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('organization_utils', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseOutline',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('objectives', djongo.models.fields.JSONField()),
                ('duration', models.CharField(max_length=50)),
                ('modules', djongo.models.fields.ArrayField(model_container=course_utils.models.Module)),
                ('summary', models.TextField()),
                ('organization', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='organization_utils.organization')),
            ],
        ),
    ]
