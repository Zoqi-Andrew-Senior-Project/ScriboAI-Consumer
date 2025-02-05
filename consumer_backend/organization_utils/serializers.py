from django.forms import ValidationError
from rest_framework import serializers
from werkzeug.security import generate_password_hash, check_password_hash
from .models import Organization, Member, Invitation, Roles
import uuid

class OrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

    def create(self, data):
        try:
            organization = Organization(**data)
            organization.save()  # Save the instance to the MongoDB
            return organization
        except ValidationError as e:
            raise serializers.ValidationError(f"Error saving organization: {e}")

class MemberSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    email = serializers.EmailField(max_length=255)
    organization = serializers.CharField(max_length=255)

    role = serializers.CharField(max_length=2, allow_blank=True, allow_null=True, required=False )
    password = serializers.CharField(write_only=True)

    def validate_role(self, value):
        if value is not None and value not in Roles.choices:
            raise ValidationError(f"Role must be one of {Roles.choices} or null.")
        return value


    def create(self, data):
        print("creating")

        org = Organization.objects.get(uuid=data['organization'])

        try:
            member = Member(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                role=data.get('role', None),  # Default to employee
                organization=org,            
            )
            member.save(password=data['password'])
            return member
        except ValidationError as e:
            raise serializers.ValidationError(f"Error saving member: {e}")
        
class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    organization_id = serializers.CharField(max_length=24)

    def create(self, validated_data):
        email = validated_data["email"]
        organization_id = validated_data["organization_id"]
        
        # Fetch the organization using the validated organization_id
        organization = Organization.objects.get(uuid=organization_id)
        
        try:
            # Generate the invitation token
            invitation_token = str(uuid.uuid4())
            
            # Create and save the Invitation object
            invite = Invitation(
                email=email, 
                verification_token=invitation_token, 
                organization=organization
                )

            invite.save()

            return invite
        except ValidationError as e:
            raise serializers.ValidationError(f"Error saving member: {e}")