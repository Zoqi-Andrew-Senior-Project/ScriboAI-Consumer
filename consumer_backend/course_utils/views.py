from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Course, Module
from .serializers import CourseWithModulesSerializer, PageSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
from .scribo_handler import ScriboHandler

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
    scribo = ScriboHandler()

    course_outline = scribo.generate_course_outline(request.data)

    course_serializer = CourseWithModulesSerializer(data=course_outline)

    if course_serializer.is_valid():
        course = course_serializer.save()

        return Response({"uuid": course.uuid}, status=status.HTTP_201_CREATED)
    
    return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_course(request):
    course = Course.objects.get(uuid=request.data['uuid'])

    course_serializer = CourseWithModulesSerializer(course)

    return Response({"course": course_serializer.data}, status=status.HTTP_200_OK)

@api_view(["POST"])
def initialize_pages(request):
    scribo = ScriboHandler()

    course = Course.objects.get(uuid=request.data['uuid'])

    modules = Module.objects.filter(course=course).order_by('order')

    for module in modules:
        module.content = scribo.generate_page(module)
        module.save()

    page_serializer = PageSerializer({"currentPage": modules[0].uuid})

    return Response(page_serializer.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def get_page(request):
    page_serializer = PageSerializer(request.data)

    return Response(page_serializer.data, status=status.HTTP_200_OK)