from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Course
from .serializers import CourseSerializer, ModuleSerializer
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

    course_serializer = CourseSerializer(data=request.data)

    if course_serializer.is_valid():
        course = course_serializer.save()

        modules = request.data['modules']

        module_data = []

        order = 0
        for module in modules:
            print(course.uuid)
            module['course_uuid'] = course.uuid
            module['order'] = order
            order += 1

            print(module)
            module_serializer = ModuleSerializer(data=module)

            if module_serializer.is_valid():
                module_instance = module_serializer.save()
                module_data.append(ModuleSerializer(module_instance).data)
                pass
            else:
                return Response(module_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        response_data = course_serializer.data
        response_data["modules"] = module_data
        return Response(response_data, status=status.HTTP_201_CREATED)
            
    return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
