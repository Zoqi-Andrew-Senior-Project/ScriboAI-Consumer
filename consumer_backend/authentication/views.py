from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.models import AuthProfile

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        auth_profile = AuthProfile.objects(username=username).first()

        if not auth_profile:
            return Response({"message": "Bad username"}, status=status.HTTP_401_UNAUTHORIZED)

        if not  auth_profile.check_password(password):        
            return Response({"message": "Bad password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
