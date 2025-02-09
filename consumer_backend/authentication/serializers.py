from rest_framework import serializers
from .models import AuthProfile
from werkzeug.security import generate_password_hash, check_password_hash

class AuthProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        auth_profile = AuthProfile(username=username)
        auth_profile.set_password(password)
        
        auth_profile.save()

        return auth_profile