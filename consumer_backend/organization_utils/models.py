from djongo import models
from django.utils.translation import gettext_lazy as _
import uuid
import random

def generate_user_id():
    return str(uuid.uuid4())

class FullNameField(models.CharField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        random_hex = ''.join([random.choice('0123456789abcdef') for _ in range(random.randint(3, 6))])
        stripped_name = model_instance.last_name[:random.randint(3,6)]
        return f"{stripped_name}{random_hex}"

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
    id = models.CharField(max_length=36, primary_key=True, default=generate_user_id, editable=False)
    user_name = FullNameField(max_length=255, unique=True)
    role = models.CharField(max_length=2,
                            choices=Roles.choices,
                            default=Roles.EMPLOYEE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    email = models.EmailField(max_length=255, unique=True)

