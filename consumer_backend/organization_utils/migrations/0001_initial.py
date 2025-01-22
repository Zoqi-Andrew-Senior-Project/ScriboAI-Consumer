# Generated by Django 3.1.12 on 2025-01-22 06:50

from django.db import migrations, models
import django.db.models.deletion
import organization_utils.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('first_name', models.CharField(max_length=255)),
                ('last_name', models.CharField(max_length=255)),
                ('id', models.CharField(default=organization_utils.models.generate_user_id, editable=False, max_length=36, primary_key=True, serialize=False)),
                ('user_name', organization_utils.models.FullNameField(max_length=255, null=True, unique=True)),
                ('role', models.CharField(choices=[('EM', 'Employee'), ('AD', 'Admin'), ('OW', 'Owner'), ('SU', 'Suspended')], default='EM', max_length=2)),
                ('email', models.EmailField(max_length=255, null=True, unique=True)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='organization_utils.organization')),
            ],
        ),
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, null=True)),
                ('verification_token', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='organization_utils.organization')),
            ],
        ),
    ]
