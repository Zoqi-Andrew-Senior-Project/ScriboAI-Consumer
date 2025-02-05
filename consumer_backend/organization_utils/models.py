import uuid
import random
from django.forms import ValidationError
from mongoengine import Document, StringField, EmailField, ReferenceField, CASCADE, DO_NOTHING, DateTimeField
from django.utils.translation import gettext_lazy as _
from authentication.models import AuthProfile
from authentication.serializers import AuthProfileSerializer

def generate_user_id():
    return str(uuid.uuid4())

class UserNameField(StringField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        if not model_instance.user_name:
            random_hex = ''.join([random.choice('0123456789abcdef') for _ in range(random.randint(3, 6))])
            stripped_name = model_instance.last_name[:random.randint(2,6)]
            generated_username = f"{stripped_name}{random_hex}"
            model_instance.user_name = generated_username
        return model_instance.user_name
    
class OrganizationUniqueField(StringField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        if not model_instance.uuid:
            while True:
                random_hex = ''.join([random.choice('0123456789abcdef') for _ in range(random.randint(9, 18))])
                stripped_name = model_instance.name[:random.randint(1,6)]
                generated_uuid = f"{stripped_name}{random_hex}"
                model_instance.uuid = generated_uuid

                # Check if this uuid is already taken by another organization
                if not Organization.objects(uuid=generated_uuid):
                    model_instance.uuid = generated_uuid
                    break  # Exit the loop when we have a unique uuid
                else:
                    # If duplicate uuid found, regenerate
                    continue
        return model_instance.uuid

class Roles:
    EMPLOYEE = "EM"
    ADMIN = "AD"
    OWNER = "OW"
    choices = [
        (EMPLOYEE, _('Employee')),
        (ADMIN, _('Admin')),
        (OWNER, _('Owner')),
    ]

class Statuses:
    ACTIVE = "AC"
    INACTIVE = "IN"
    PENDING = "PE"
    SUSPENDED = "SU"
    choices = [
        (ACTIVE, _('Active')),
        (INACTIVE, _('Inactive')),
        (PENDING, _('Pending')),
        (SUSPENDED, _('Suspended')),
    ]

class Organization(Document):
    name = StringField(max_length=255)
    uuid = OrganizationUniqueField(unique=True)

    meta = {
        "indexes": ["name", "uuid"]
    }

    def save(self, *args, **kwargs):
        if not self.uuid:
            self.uuid = OrganizationUniqueField().pre_save(self, True)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        for member in Member.objects(organization=self):
            member.delete()
        super().delete(*args, **kwargs)

class Member(Document):
    first_name = StringField(max_length=255)
    last_name = StringField(max_length=255)
    user_name = UserNameField(max_length=255, unique=True)
    role = StringField(max_length=2, choices=Roles.choices, default=Roles.EMPLOYEE)
    status = StringField(max_length=2, choices=Statuses.choices, default=Statuses.PENDING)
    organization = ReferenceField(Organization, reverse_delete_rule=DO_NOTHING)
    email = EmailField(max_length=255, null=False)
    user = ReferenceField(AuthProfile, reverse_delete_rule=CASCADE, null=True, blank=True)
    
    meta = {
        "indexes": ["user_name", "role", "status", ("first_name", "last_name")]
    }

    def save(self, *args, **kwargs):
        if not self.user_name:
            self.user_name = UserNameField().pre_save(self, True)

        password = kwargs.pop("password", None)
        if not self.user:
            authprofileserializer = AuthProfileSerializer(data={
                "username": self.user_name,
                "password": password
            })
            if authprofileserializer.is_valid():
                self.user = authprofileserializer.save()
            else:
                raise ValidationError(authprofileserializer.errors)

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        print(f"Deleting member {self.user}")
        self.user.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} {self.user_name}"

class Invitation(Document):
    email = EmailField(unique=False, null=True)
    organization = ReferenceField(Organization, reverse_delete_rule=CASCADE)
    verification_token = StringField(max_length=255, unique=True)
    created_at = DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.verification_token
