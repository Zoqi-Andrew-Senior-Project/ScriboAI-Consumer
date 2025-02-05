from rest_framework import serializers
from .models import AuthProfile
from werkzeug.security import generate_password_hash, check_password_hash

class AuthProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        auth_profile = AuthProfile(
            username=username,
            password_hash=generate_password_hash(password)
        )
        
        auth_profile.save()

        return auth_profile
    
    def authenticate(self, data):
        username = data.get('username')
        password = data.get('password')

        # Fetch the AuthProfile based on the provided username
        auth_profile = AuthProfile.objects(username=username).first()

        if not auth_profile:
            raise serializers.ValidationError("Invalid credentials")

        # Check if the password matches
        if not check_password_hash(auth_profile.password_hash, password):
            raise serializers.ValidationError("Invalid credentials")

        # Update last active time on successful login
        auth_profile.update_last_active()  # This assumes you have the `update_last_active` method
        return auth_profile