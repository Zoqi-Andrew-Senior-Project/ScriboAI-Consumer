from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Organization, Invitation, Member
from .serializers import OrganizationSerializer, MemberSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.mail import send_mail
import uuid
from django.contrib.auth.hashers import make_password
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
                        "password": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Password to authenticate the account."
                            ),
                    }
        )
)
@api_view(["POST"])
def create_organization(request):
    """
    Create a new organization.

    ### Request:
    - name: The name of the organization.
    - first_name: The first name of the owner.
    - last_name: The last name of the owner.
    - email: The email of the owner.
    - password: The password to authenticate the account.

    ### Response:
    - 201: Successfully created a new organization.
    - 400: Invalid input.

    ### Actions:
    - Creates an organization model.
    - Creates a member model.
        - role: "OW" Owner
        - organization: The organization id.    
    """

    # assigns variables from request body
    name = request.data.get("name")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")
    password = request.data.get("password")

    organization_serializer = OrganizationSerializer(data={"name": name})
    
    if organization_serializer.is_valid():
        organization = organization_serializer.save()
        
        member_serializer = MemberSerializer(data={
            "first_name": first_name, 
            "last_name": last_name, 
            "email": email, 
            "organization": organization.id,
            "role": "OW",
            "password": make_password(password),
        })
        
        if member_serializer.is_valid():
            member = member_serializer.save()

            return Response({
                "status": "success",
                "message": "Organization created successfully!",
                "data": {
                    "organization": organization_serializer.data,
                    "member": member_serializer.data
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid input.",
            "data": member_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)  
      
    return Response({
        "status": "error",
        "message": "Invalid input.",
        "data": organization_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
        method='post',
        operation_summary="Deletes an organization.",
        responses={
            status.HTTP_201_CREATED: "Successfully deletes an organization.",
            status.HTTP_400_BAD_REQUEST: "Invalid input."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "id": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The id of the organization."
                            )
                    }
        )
)
@api_view(["POST"])
def delete_organization(request):
    """
    Deletes an  organization.

    ### Request:
    - id: The id of the organization.

    ### Response:
    - 201: Successfully deleted the organization.
    - 400: Invalid input.

    ### Actions:
    - Creates an organization model.
    - Creates a member model.
        - role: "OW" Owner
        - organization: The organization id.    
    """

    request_id = request.data.get("id")
    instance = Organization.objects.get(id=request_id)
    if instance:
        instance.delete()
        return Response(f"{request_id} deleted successfully!", status=status.HTTP_201_CREATED)
    
    return Response("Invalid input.",status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
        method='post',
        operation_summary="Validates an invitation token.",
        responses={
            status.HTTP_201_CREATED: "Token is valid!",
            status.HTTP_400_BAD_REQUEST: "Invalid input."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "invitation_token": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Token for the invitation."
                            )
                    }
        )
)
@api_view(["POST"])
def validate_invite_token(request, invitation_token):
    """
    Validates an invitation token.
    """

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
    """
    Send a user an invitation to join an organization.
    """
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

    return Response({"token": invitation_token}, status=status.HTTP_200_OK)

# generates an invite token
def generate_invite_token():
    return str(uuid.uuid4())

@swagger_auto_schema(
        method='post',
        operation_summary="Completes profile created from invitation token.",
        responses={
            status.HTTP_200_OK: "Successfully sent an email to the user."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "token": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The invitation token."
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
                        "password": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Password to authenticate the account."
                            ),
                    }
        )
)
@api_view(["POST"])
def complete_profile(request):
    """
    Complete a user's profile.
    """
    token = request.data.get("token")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    password = request.data.get("password")

    invitation = Invitation.objects.get(verification_token=token)
    organization: Organization = invitation.organization
    email = invitation.email

    member_serializer = MemberSerializer(data={
        "first_name": first_name, 
        "last_name": last_name, 
        "role": "EM", 
        "email": email, 
        "organization": organization.id, 
        "password": make_password(password),
    })

    if member_serializer.is_valid():
        member = member_serializer.save()
        return Response(member_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(member_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@swagger_auto_schema(
        method='post',
        operation_summary="Deletes a member from an organization.",
        responses={
            status.HTTP_200_OK: "Successfully sent an email to the user."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "member_id": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The ID of the member to delete."
                            ),
                    }
        )
)
@api_view(["POST"])
def delete_member(request):
    """
    Delete a member from an organization.
    """
    member_id = request.data.get("member_id")
    member = Member.objects.get(id=member_id)
    member.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)