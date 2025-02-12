import os
from django.core.mail import EmailMultiAlternatives
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from .models import Organization, Invitation, Member, Roles
from .serializers import OrganizationSerializer, MemberSerializer, InviteMemberSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.permissions import IsAuthenticated
from .permissions import *
from django.template.loader import render_to_string

# Create your views here.

@swagger_auto_schema(
        method='get',
        operation_summary="Validates an invitation token.",
        responses={
            status.HTTP_201_CREATED: "Token is valid!",
            status.HTTP_400_BAD_REQUEST: "Invalid input."
        },
        manual_parameters=[
        openapi.Parameter(
            'invitation_token',  # Name of the parameter
            openapi.IN_PATH,      # Parameter is in the path
            description='Token for the invitation.',
            type=openapi.TYPE_STRING,
            required=True          # This is required in the URL
        )
    ]
)
@api_view(["GET"])
def validate_invite_token(request, invitation_token):
    """
    Validates an invitation token.
    """

    try:
        invitation = Invitation.objects.get(verification_token=invitation_token)

        return Response({
            "status": "success",
            "message": "Token is valid!",
            "data": {
                "email": invitation.email,
                "organization": invitation.organization.name
            }
        }, status=status.HTTP_202_ACCEPTED)

    except Invitation.DoesNotExist:
        return Response("Invalid invitation token.", status=status.HTTP_400_BAD_REQUEST)
    
class OrganizationView(APIView):
    def get_permissions(self):
        if self.request.method in ['DELETE']:
            permission_classes = [IsAuthenticated, IsOwner]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
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
    def post(self, request):
        """
        Create a new organization.

        ### Permissions:
        - None.

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

        # Validate member data first
        member_serializer = MemberSerializer(data={
            "first_name": first_name, 
            "last_name": last_name, 
            "email": email, 
            "role": Roles.OWNER,
            "password": password,
            "organization": None
        })

        if not member_serializer.is_valid():
            return Response({
                "status": "error",
                "message": "Invalid input for Member.",
                "data": member_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        # Validate organization data
        organization_serializer = OrganizationSerializer(data={"name": name})
        if not organization_serializer.is_valid():
            return Response({
                "status": "error",
                "message": "Invalid input for Organization.",
                "data": organization_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        organization = organization_serializer.save()

        member_serializer.validated_data["organization"] = organization.uuid
        member=member_serializer.save()

        return Response({
            "status": "success",
            "message": "Organization created successfully!",
            "data": {
                "organization": organization_serializer.data,
                "member": member_serializer.data
            }
        }, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
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
    def delete(self, request):
        """
        Deletes an  organization.

        ### Permissions:
        - IsAuthenticated - Must be logged in and have an active session.
        - IsOwner - Must be an owner of an organization.

        ### Request:
        - None.

        ### Response:
        - 201: Successfully deleted the organization.
        - 400: Invalid input.

        ### Actions:
        - Deletes an organization model.
        - Deletes all members of the organization
        """

        
        user = request.user

        organization: Organization = Member.objects.get(user_name=user.username).organization
        if organization:
            organization.delete()
            return Response({
                "status": "success",
                "message": f"Organization {organization.uuid}, {organization.name} deleted successfully!",
            }, status=status.HTTP_200_OK)
        
        return Response({
            "status": "error",
            "message": "Invalid input.",
            "errors": {
                "id": "Organization does not exist."
            }
        },status=status.HTTP_400_BAD_REQUEST)

class InviteMemberView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    @swagger_auto_schema(
            operation_summary="Emails a user an invite to create an account and join the organization.",
            responses={
                status.HTTP_201_CREATED: "Invite sent!",
                status.HTTP_400_BAD_REQUEST: "Invalid input.",
                status.HTTP_404_NOT_FOUND: "Member does not exist."
            },
            request_body= openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "email": openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description="The email of the person to invite."
                                )
                        }
            )
    )
    def post(self, request):
        """
        Send a user an invitation to join an organization.

        ### Permissions:
        - IsAuthenticated - Must be logged in and have an active session.
        - IsOwnerOrAdmin - Must be an owner or admin of an organization.

        ### Request:
        - email: the email of the person to invite.

        ### Response:
        - 201: Successfully sends the invite.
        - 400: Invalid input.
        - 404: The member doesn't exist.

        ### Actions:
        - Creates an Invitation document in the database that ties an invitation token to an organization and an email.
        - Emails a message to the provided email address with a link to complete their profile. 
        """
        user = request.user # get auth profile of user making the request

        try:

            member: Member = Member.objects.get(user_name=user.username)
            organization: Organization = member.organization

            # Check for existing invitations and delete them
            existing_invitation = Invitation.objects(email=request.data.get("email"), organization=organization)

            for invitation in existing_invitation:
                invitation.delete()

            data = {
                "email": request.data.get("email"),
                "organization_id": organization.uuid
            }

            serializer = InviteMemberSerializer(data=data)
            if serializer.is_valid():
                invitation_token = serializer.save()

                # compost email
                subject = "You're invited to ScriboAI!"
                body = "Congrats 😁"

                context = {
                    "organization_name": organization.name,
                    "link": os.getenv("REACT_APP_BACKEND_ADDRESS") + f"/api/org/validate-invite/{invitation_token}/",
                    "image": "http://scriboai.tech/static/media/logo.58c00fb0d1fb34fa34b4.png",
                }

                html_content = render_to_string("invite.html", context)

                email = EmailMultiAlternatives(
                    subject,
                    body,
                    "Scribo <sender@scriboai.tech>",
                    ["martinezjandrew@gmail.com"], # request.data.get("email")
                )

                email.attach_alternative(html_content, "text/html")

                email.send()

                return Response({"token": invitation_token.verification_token}, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "status": "error",
                    "message": "Invalid input.",
                    "data": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Member.DoesNotExist:
            return Response({"error": "Member does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
    @swagger_auto_schema(
            operation_summary="Deletes an active invitation.",
            responses={
                status.HTTP_201_CREATED: "Successfully deletes the invitation.",
                status.HTTP_400_BAD_REQUEST: "Invalid input.",
            },
            request_body= openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "invitation_token": openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description="The token of the invitation to delete."
                                )
                        }
            )
    )
    def delete(self, request):
        """
        Deletes an invitation.

        ### Permissions:
        - IsAuthenticated - Must be logged in and have an active session.
        - IsOwnerOrAdmin - Must be an owner or admin of an organization.

        ### Request:
        - Invitation Token: The token of the invitation to delete.

        ### Response:
        - 204: Successfully deletes the Invitation document.
        - 404: Couldn't find the Invitation from the provided token.

        ### Actions:
        - Deletes the Invitation document from the database.
        - Makes the token invalid to use when creating a profile.
        """
        invitation_token = request.data.get("invitation_token")

        try:
            invitation = Invitation.objects.get(verification_token=invitation_token)
            invitation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Invitation.DoesNotExist:
            return Response({"error": "Invitation does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
class MemberView(APIView):
    def get_permissions(self):
        if self.request.method in ['DELETE']:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        elif self.request.method in ['GET']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_summary="Complete's a user's profile.",
        responses={
            # status.HTTP_201_CREATED: "Profile created successfully!",
            # status.HTTP_400_BAD_REQUEST: "Invalid input.",
            # status.HTTP_404_NOT_FOUND: "Invalid token."
            202: openapi.Response(
                description="Token is valid!",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "email": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The email belonging to the user."
                            ),
                        "organization": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The organization id the user belongs to."
                            ),
                        "first_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The first name of the user."
                            ),
                        "last_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The last name of the user."
                            ),
                        "role": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The role of the user."
                            ),
                        "user_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The username of the user."
                            ),
                    }
                )
            ),
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "token": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The token of the invitation to delete."
                            ),
                        "first_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The first name of the user."
                            ),
                        "last_name": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="The last name of the user."
                            ),
                        "password": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Password to authenticate the account."
                            ),
                    }
        )
    )
    def post(self, request):
        """
        Complete a user's profile.
        """
        token = request.data.get("token")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        password = request.data.get("password")

        try:
            invitation = Invitation.objects.get(verification_token=token)
            organization: Organization = invitation.organization.uuid
            email = invitation.email


            data = {
                "first_name": first_name, 
                "last_name": last_name,
                "email": email, 
                "organization": organization, 
                "password": password,
            }

            member_serializer = MemberSerializer(data=data)

            if member_serializer.is_valid():
                member = member_serializer.save()
                return Response({
                    "status": "success",
                    "message": "Profile created successfully!",
                    "data": member_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "status": "error",
                    "message": "Invalid input.",
                    "data": member_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Invitation.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Invalid token.",
                "data": member_serializer.errors
            }, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_summary="Deletes a member.",
        responses={
            status.HTTP_200_OK: "Successfully sent an email to the user."
        },
        request_body= openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "member_username": openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="member_username."
                            ),
                    }
        )
    )
    def delete(self, request):
        """
        Delete a member from an organization.

        ### Permissions:
        - IsAuthenticated - Must be logged in and have an active session.
        - IsOwner - Must be an owner of an organization.

        ### Request:
        - member_username: member_username.

        ### Response:
        - 204: Successfully deletes the member.
        - 404: The username doesn't belong to any member.

        ### Actions:
        - Deletes a member from the database.
        - Deletes the auth profile of the member. 
        """
        username = request.data.get("member_username")

        try:
            member = Member.objects.get(user_name=username)
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Member.DoesNotExist:
            return Response({"error": "Member does not exist."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        """
        Returns profile details of the member.
        """
        user = request.user

        try:
            member: Member = Member.objects.get(user_name=user.username)

            return Response({
                "first_name": member.first_name,
                "last_name": member.last_name,
                "email": member.email,
                "role": member.role,
                "organization": member.organization.name,
                "status": member.status,
                "email": member.email
            }, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member does not exist."}, status=status.HTTP_404_NOT_FOUND)