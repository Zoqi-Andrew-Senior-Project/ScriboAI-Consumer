from rest_framework import serializers
from .models import User
import bcrypt

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        hashed_password = bcrypt.hashpw(
            validated_data['password'].encode('utf-8'), bcrypt.gensalt()
        )
        validated_data['password'] = hashed_password.decode('utf-8')
        return super().create(validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
