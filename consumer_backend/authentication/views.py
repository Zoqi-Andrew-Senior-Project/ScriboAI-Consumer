from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.models import AuthProfile

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        auth_profile = AuthProfile.objects(username=username).first()

        if auth_profile and auth_profile.check_password(password):
            auth_profile.update_last_active()  # Update last activity timestamp
            return Response(
                {"message": "Login successful", "last_active_at": auth_profile.last_active_at},
                status=status.HTTP_200_OK
            )
        
        return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
