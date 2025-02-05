from mongoengine import Document, EmbeddedDocument, StringField, ListField, EmbeddedDocumentField, ReferenceField, EnumField
from enum import Enum
from organization_utils.models import Organization


class FeatureEnum(Enum):
    VIDEO = "video"
    IMAGE = "image"
    INTERACTIVE = "interactive"


class Module(EmbeddedDocument):
    name = StringField(max_length=255)
    duration = StringField(max_length=50)
    sub_topics = ListField(StringField())
    features = ListField(EnumField(FeatureEnum))

    
    meta = {
        "indexes": ["name", "duration", "sub_topics", "features"]
    }

class CourseOutline(Document):
    title = StringField(max_length=255)
    objectives = ListField(StringField())
    duration = StringField(max_length=50)
    modules = ListField(EmbeddedDocumentField('Module'))
    summary = StringField()
    organization = ReferenceField(Organization, reverse_delete_rule='CASCADE', default=1)

    meta = {
        "indexes": ["title", "objectives", "duration", "modules", "summary"]
    }