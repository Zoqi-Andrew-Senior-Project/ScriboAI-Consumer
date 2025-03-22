from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Course, Module
from .serializers import CourseWithModulesSerializer, PageSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
from .scribo_handler import ScriboHandler
from organization_utils.models import Member, Organization
from rest_framework.permissions import IsAuthenticated
from organization_utils.permissions import IsOwnerOrAdmin
from rest_framework.views import APIView

class CourseView(APIView):
    def get_permissions(self):
        if self.request.method in ['DELETE', 'POST']:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        elif self.request.method in ['GET']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]
    
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
    def post(self, request):
        """
        Create a course outline.
        """

        try:
            user = request.user

            member: Member = Member.objects.get(user_name=user.username)

            scribo = ScriboHandler()

            course_outline = scribo.generate_course_outline(request.data)

            course_outline["organization"] = member.organization.uuid

            course_serializer = CourseWithModulesSerializer(data=course_outline)

            if course_serializer.is_valid():
                course = course_serializer.save()

                return Response({"uuid": course.uuid}, status=status.HTTP_201_CREATED)
            
            return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Member.DoesNotExist:
            return Response("member doesnt exist...", status=status.HTTP_404_NOT_FOUND)
        
    def get(self, request):
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
    print(request.query_params)
    data = {}

    if request.query_params.get("course", None):
        data["course"] = request.query_params.get("course")

    if request.query_params.get("currentPage", None):
        data["currentPage"] = request.query_params.get("currentPage")

    if not (data.get("course", None) or data.get("currentPage", None)):
        return Response({"error": "Need 'course' or 'currentPage'"}, status=status.HTTP_400_BAD_REQUEST)
    
    print(data)

    page_serializer = PageSerializer(data=request.query_params)

    if page_serializer.is_valid():
        return Response(page_serializer.data, status=status.HTTP_200_OK)

    return Response({"error": page_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)