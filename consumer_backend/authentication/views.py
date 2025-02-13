from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.models import AuthProfile
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view



class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        auth_profile = AuthProfile.objects(username=username).first()

        if auth_profile and auth_profile.check_password(password):
            request.session["auth_profile_id"] = str(auth_profile.id)
            request.session.set_expiry(3600)  # Set session expiry to 1 hour
            return Response({"message": "Login successful", "logged_in": True}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials", "logged_in": False}, status=status.HTTP_401_UNAUTHORIZED)
        
class ProfileView(APIView):
    def get(self, request):
        auth_profile_id = request.session.get("auth_profile_id")
        if not auth_profile_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        auth_profile = AuthProfile.objects(id=auth_profile_id).first()
        if not auth_profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "username": auth_profile.username
        }, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    def post(self, request):
        auth_profile_id = request.session.get("auth_profile_id")
        if not auth_profile_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        request.session.flush()  # Clear the session data
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

@ensure_csrf_cookie
@api_view(["GET"])
def get_csrf_token(request):
    return Response({"detail": 'CSRF cookie set'}, status=200)
