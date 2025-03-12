from mongoengine import Document, EmbeddedDocument, fields, CASCADE
from enum import Enum
from organization_utils.models import Organization
import uuid


class FeatureEnum(Enum):
    VIDEO = "video"
    IMAGE = "image"
    INTERACTIVE = "interactive"

# 🔹 Course Model
class Course(Document):
    uuid = fields.StringField(default=lambda: str(uuid.uuid4()), unique=True)  # UUID for referencing
    title = fields.StringField(max_length=255)
    objectives = fields.ListField(fields.StringField())
    duration = fields.StringField(max_length=50)
    summary = fields.StringField()


# 🔹 Module Model
class Module(Document):
    name = fields.StringField(max_length=255)
    duration = fields.StringField(max_length=50)
    subtopics = fields.ListField(fields.StringField())
    features = fields.ListField(fields.StringField(choices=[e.value for e in FeatureEnum]))
    course = fields.ReferenceField(Course, reverse_delete_rule=CASCADE)  # Ensure proper referencing
    order = fields.IntField()