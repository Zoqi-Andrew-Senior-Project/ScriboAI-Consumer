from rest_framework import serializers
from .models import Organization, Member

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['name']

class MemberSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Member
        fields = ['first_name', 'last_name', 'role', 'organization', 'email', "password"]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        member = Member(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            role=validated_data.get('role', 'EM'),  # Default to employee
            organization=validated_data.get('organization'),  # Ensure organization is passed
        )

        member.save(password=password)
        
        return member