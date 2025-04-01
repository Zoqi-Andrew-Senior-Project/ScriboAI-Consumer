from rest_framework.authentication import BaseAuthentication
from authentication.models import AuthProfile 

class MongoEngineSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Retrieve the auth_profile_id from the session
        auth_profile_id = request.session.get("auth_profile_id")

        if auth_profile_id:
            try:
                # Fetch the AuthProfile from MongoEngine
                auth_profile = AuthProfile.objects(id=auth_profile_id).first()
                if auth_profile:
                    return (auth_profile, None)  # User and AuthToken are returned (None for no token)
            except AuthProfile.DoesNotExist:
                return None
        return None
    def get_user(self, auth_profile_id):
        try:
            return AuthProfile.objects(id=auth_profile_id).first()
        except AuthProfile.DoesNotExist:
            return None