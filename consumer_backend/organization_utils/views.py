from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Organization, Member
from .serializers import OrganizationSerializer, MemberSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
# Create your views here.

@api_view(["POST"])
def create_organization(request):
    """
    Create a new organization.

    Parameters:
    - name: string
    - first_name: string
    - last_name: string
    - email: string
    """

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
