from mongoengine import Document, EmbeddedDocument, fields
from enum import Enum
from organization_utils.models import Organization


class FeatureEnum(Enum):
    VIDEO = "video"
    IMAGE = "image"
    INTERACTIVE = "interactive"


class Module(EmbeddedDocument):
    name = fields.StringField(max_length=255)
    duration = fields.StringField(max_length=50)
    subtopics = fields.ListField(fields.StringField())
    features = fields.ListField(fields.StringField(choices=[e.value for e in FeatureEnum]))


class CourseOutline(Document):
    title = fields.StringField(max_length=255)
    objectives = fields.ListField(fields.StringField())
    duration = fields.StringField(max_length=50)
    modules = fields.EmbeddedDocumentListField(Module)
    summary = fields.StringField()
    organization = fields.ReferenceField(Organization, reverse_delete_rule=fields.DO_NOTHING)
