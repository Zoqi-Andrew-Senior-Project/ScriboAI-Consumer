from djongo import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
import uuid
import random

def generate_user_id():
    return str(uuid.uuid4())

class FullNameField(models.CharField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        if not model_instance.user_name:
            random_hex = ''.join([random.choice('0123456789abcdef') for _ in range(random.randint(3, 6))])
            stripped_name = model_instance.last_name[:random.randint(3,6)]
            generated_username = f"{stripped_name}{random_hex}"
            model_instance.user_name = generated_username
        return model_instance.user_name

# Create your models here.

class Roles(models.TextChoices):
    EMPLOYEE = "EM", _('Employee') # default
    ADMIN = "AD", _('Admin') # admin of the organization also means training manager
    OWNER = "OW", _('Owner') # owner of the organization
    SUSPENDED = "SU", _('Suspended') # marked for removal

class Organization(models.Model):
    name = models.CharField(max_length=255)

    def delete(self, *args, **kwargs):
        for member in Member.objects.filter(organization=self):
            member.delete()
        super().delete(*args, **kwargs)

class Member(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    id = models.CharField(max_length=36, primary_key=True, default=generate_user_id, editable=False)
    user_name = FullNameField(max_length=255, unique=True)
    role = models.CharField(max_length=2,
                            choices=Roles.choices,
                            default=Roles.EMPLOYEE)
    organization = models.ForeignKey(Organization, on_delete=models.DO_NOTHING)
    email = models.EmailField(max_length=255, unique=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.user_name:
            self.user_name = FullNameField().pre_save(self, True)

        password = kwargs.pop("password", None)
        if not self.user:
            user = User.objects.create_user(
                username=self.user_name,
                email=self.email,
                first_name=self.first_name,
                last_name=self.last_name,
            )

            if password:
                if password:
                    user.set_password(password)
                else:
                    user.set_unusable_password()
            user.save()
            self.user = user
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        print(f"Deleting member {self.user}")
        if self.user:
            print(f"Deleting user {self.user}")
            User.objects.get(username=self.user_name).delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} {self.user_name}"

class Invitation(models.Model):
    email = models.EmailField(unique=False, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    verification_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.user_name
    

