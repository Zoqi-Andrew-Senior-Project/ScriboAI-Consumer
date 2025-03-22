from mongoengine import Document, EmbeddedDocument, fields, CASCADE
from enum import Enum
from organization_utils.models import Organization
import uuid


class FeatureEnum(Enum):
    VIDEO = "video"
    IMAGE = "image"
    INTERACTIVE = "interactive"

class StatusEnum(Enum):
    TEMP = "temp" # only seen by author during creation - automatically removed if not saved as draft or published
    DRAFT = "draft" # can be seen by any user with editing rights
    PUBLISH = "published" # can be seen by read only rights

# 🔹 Course Model
class Course(Document):
    uuid = fields.StringField(default=lambda: str(uuid.uuid4()), unique=True)  # UUID for referencing
    title = fields.StringField(max_length=255)
    objectives = fields.ListField(fields.StringField())
    duration = fields.StringField(max_length=50)
    summary = fields.StringField()
    status = fields.StringField(choices=[e.value for e in StatusEnum], default=StatusEnum.TEMP)
    organization = fields.ReferenceField(Organization, reverse_delete_rule=CASCADE) # refers to owner of the course

    def __str__(self):
        return self.uuid


# 🔹 Module Model
class Module(Document):
    uuid = fields.StringField(default=lambda: str(uuid.uuid4()), unique=True)  # UUID for referencing
    name = fields.StringField(max_length=255)
    duration = fields.StringField(max_length=50)
    subtopics = fields.ListField(fields.StringField())
    features = fields.ListField(fields.StringField(choices=[e.value for e in FeatureEnum]))
    course = fields.ReferenceField(Course, reverse_delete_rule=CASCADE)  # Ensure proper referencing
    order = fields.IntField()
    content = fields.StringField(default="No data.")

    def __str__(self):
        return self.name