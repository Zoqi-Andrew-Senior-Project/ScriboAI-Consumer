from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from organization_utils.models import Member

class BaseUser(AbstractBaseUser):
    username = models.ForeignKey(Member, on_delete=models.CASCADE)
