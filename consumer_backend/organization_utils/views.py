from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Organization, Member
from .serializers import OrganizationSerializer, MemberSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
# Create your views here.
"""
@swagger_auto_schema(
        method='post',
        operation_summary="Create a new organization",
        operation_description="Endpoint to create a new organization with a name.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="The name of the organization"),
        },
    ),
    responses={
        201: "Organization created successfully.",
        400: "Invalid request data.",
    },
)
"""
@api_view(["POST"])
def create_organization(request):
    """
    Create a new organization.
    """

    serializer = OrganizationSerializer(data=request.data)

    if serializer.is_valid():
        organization = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
