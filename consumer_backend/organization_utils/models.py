from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Roles(models.TextChoices):
    EMPLOYEE = "EM", _('Employee') # default
    ADMIN = "AD", _('Admin') # admin of the organization
    OWNER = "OW", _('Owner') # owner of the organization
    SUSPENDED = "SU", _('Suspended') # marked for removal

class Organization(models.Model):
    name = models.CharField(max_length=255)

class Member(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    user_id = models.CharField(max_length=255)
    role = models.CharField(max_length=2,
                            choices=Roles.choices,
                            default=Roles.EMPLOYEE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

