from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import CourseOutline
from .serializers import CourseOutlineSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json

"""
@swagger_auto_schema(
        method='post',
        operation_summary="Create a course outline.",
        operation_description="Endpoint to create a new course outline.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'title': openapi.Schema(type=openapi.TYPE_STRING, description="The title of the course"),
                'objectives': openapi.Schema(type=openapi.TYPE_STRING, description="The lesson objectives for the course"),
                'duration': openapi.Schema(type=openapi.TYPE_STRING, description="The desired estimated time duration of the course"),
                'modules': openapi.Schema(type=openapi.TYPE_STRING, description="Modules that the course is made of"),
                'summary': openapi.Schema(type=openapi.TYPE_STRING, description="The summary of the course"),
                'organization': openapi.Schema(type=openapi.TYPE_STRING, description="The organization the course belongs too"),
        },
    ),
    responses={
        201: "Organization created successfully.",
        400: "Invalid request data.",
    },
)
"""
@api_view(["POST"])
def create_course_outline(request):
    """
    Create a course outline.
    """

    serializer = CourseOutlineSerializer(data=request.data)

    if serializer.is_valid():
        CourseOutline = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
