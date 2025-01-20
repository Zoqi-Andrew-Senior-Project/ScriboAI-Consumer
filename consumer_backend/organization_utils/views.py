from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Organization, Invitation
from .serializers import OrganizationSerializer, MemberSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
import requests
from django.core.mail import send_mail
import uuid
# Create your views here.

@swagger_auto_schema(
        method='post',
        operation_summary="Create a new organization.",
        responses={
            status.HTTP_201_CREATED: "Successfully created a new organization.",
            status.HTTP_400_BAD_REQUEST: "Invalid input."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The name of the organization."
                            ),
                        "first_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The first name of the owner."
                            ),
                        "last_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The last name of the owner."
                            ),
                        "email": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The last name of the owner."
                            ),
                    }
        )
)
@api_view(["POST"])
def create_organization(request):
    name = request.data.get("name")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")

    organization_serializer = OrganizationSerializer(data={"name": name})
    
    if organization_serializer.is_valid():
        organization = organization_serializer.save()
        
        member_serializer = MemberSerializer(data={
            "first_name": first_name, 
            "last_name": last_name, 
            "email": email, 
            "organization": organization.id,
            "role": "OW"})
        
        if member_serializer.is_valid():
            member = member_serializer.save()
            return Response(member_serializer.data, status=status.HTTP_201_CREATED)
        return Response(member_serializer.errors, status=status.HTTP_400_BAD_REQUEST)    
    return Response(organization_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def delete_organization(request):
    """
    Delete an organization.
    """

    request_id = request.data.get("id")
    instance = Organization.objects.get(id=request_id)
    if instance:
        instance.delete()
        return Response(f"{request_id} deleted successfully!", status=status.HTTP_201_CREATED)
    
    return Response("WHOOPS",status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def create_member(request):
    """
    Create a new member for an organization.
    """

    serializer = MemberSerializer(data=request.data)

    if serializer.is_valid():
        member = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def create_member_by_token(request, invitation_token):
    try:
        invitation = Invitation.objects.get(verification_token=invitation_token)

        return Response(f"Success! Welcome {invitation.email} to {invitation.organization.name}", status=status.HTTP_202_ACCEPTED)

    except Invitation.DoesNotExist:
        return Response("Invalid invitation token.", status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
        method='post',
        operation_summary="Invite users to an organization.",
        responses={
            status.HTTP_200_OK: "Successfully sent an email to the user."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "email": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The email of the new member to invite."
                            ),
                        "organization_id": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The ID of the organization the member is being invited to."
                            ),
                    }
        )
)
@api_view(["POST"])
def invite_member(request):
    invitation_token = generate_invite_token()
    email = request.data.get("email")
    organization_id = request.data.get("organization_id")
    organization = Organization.objects.get(id=organization_id)
    Invitation.objects.create(email=email, verification_token=invitation_token, organization=organization)

    subject = "You're invited to ScriboAI!"
    message = f"You've been invited to join {organization.name}.\n\nClick here to accept the invitation: {invitation_token}"

    """send_mail(
        subject, 
        message, 
        "martinezjandrew@gmail.com", 
        [email]
    )"""

    return Response(f"{invitation_token}", status=status.HTTP_200_OK)

def generate_invite_token():
    return str(uuid.uuid4())