from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Organization, Member
import json
# Create your views here.

@api_view(["POST"])
def create_organization(request):
    data = json.loads(request.body)

    organization = Organization(
        name = data["name"]
    )

    organization.save()

    return Response(organization.name, status=status.HTTP_200_OK)

@api_view(["POST"])
def create_member(request):
    data = json.loads(request.body)

    member = Member(
        first_name = data["first_name"],
        last_name = data["last_name"],
        user_id = data["user_id"],
        role = data["role"],
        organization = data["organization"]
    )

    member.save()

    return Response(member.first_name, status=status.HTTP_200_OK)
