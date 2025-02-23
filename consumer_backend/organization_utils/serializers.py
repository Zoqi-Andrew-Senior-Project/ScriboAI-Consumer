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
    role = serializers.CharField(max_length=2, allow_blank=True, allow_null=True, required=False)
    password = serializers.CharField(write_only=True)
    organization = serializers.CharField(max_length=24, allow_null=True)
    user_name = serializers.CharField(max_length=255, read_only=True)
    status = serializers.CharField(max_length=2, allow_blank=True, allow_null=True, required=False)

    def validate_role(self, value):
        if value is not None and value not in Roles.valid_roles:
            raise ValidationError(f"Role must be one of {Roles.choices} or null.")
        return value


    def create(self, data):
        org_uuid = data.pop('organization')

        try:
            org = Organization.objects.get(uuid=org_uuid)
        except Organization.DoesNotExist:
            raise serializers.ValidationError(f"Organization with UUID {org_uuid} does not exist.")

        try:
            member = Member(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                role=data.get('role'),  # Default to employee
                organization=org,            
            )
            member.save(password=data['password'])
            self.user_name = member.user_name
            return member
        except ValidationError as e:
            raise serializers.ValidationError(f"Error saving member: {e}")
        
class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    organization = serializers.CharField(max_length=24)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        email = validated_data["email"]
        organization = validated_data["organization"]
        
        # Fetch the organization using the validated organization_id
        organization = Organization.objects.get(uuid=organization)
        
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