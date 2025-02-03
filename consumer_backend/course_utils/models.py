from djongo import models
from enum import Enum
from organization_utils.models import Organization


class FeatureEnum(Enum):
    VIDEO = "video"
    IMAGE = "image"
    INTERACTIVE = "interactive"


class Module(models.Model):
    name = models.CharField(max_length=255)
    duration = models.CharField(max_length=50)
    subtopics = models.JSONField()
    features = models.JSONField()

    class Meta:
        abstract = True


class CourseOutline(models.Model):
    title = models.CharField(max_length=255)
    objectives = models.JSONField()
    duration = models.CharField(max_length=50)
    modules = models.ArrayField(model_container=Module)
    summary = models.TextField()
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, default=1)
