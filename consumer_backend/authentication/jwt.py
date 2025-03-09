from rest_framework_simplejwt.tokens import AccessToken
from .models import AuthProfile

class CustomJWTTokenGenerator:
    @staticmethod
    def generate_token(auth_profile_id):
        token = AccessToken()
        token['auth_profile_id'] = auth_profile_id
        return str(token)