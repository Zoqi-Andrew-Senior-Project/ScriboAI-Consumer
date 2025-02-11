from mongoengine import Document, StringField, DateTimeField, ReferenceField
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class AuthProfile(Document):
    username = StringField(required=True)
    password_hash = StringField(required=True)
    created_at = DateTimeField(default=datetime.now())  # Account creation timestamp
    last_active_at = DateTimeField(default=datetime.now())  # Last activity timestamp

    def set_password(self, password):
        """Hashes and stores the password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password) -> bool:
        """Verifies the provided password."""
        return check_password_hash(self.password_hash, password)
    
    def update_last_active(self):
        """Updates last activity timestamp."""
        self.last_active_at = datetime.datetime.utcnow()
        self.save()
