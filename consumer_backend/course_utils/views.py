from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import CourseOutline
import json


@api_view(["POST"])
def create_course_outline(request):
    data = json.loads(request.body)

    course = CourseOutline(
        title=data["title"],
        objectives=data["objectives"],
        duration=data["duration"],
        modules=data["modules"],
        summary=data["summary"],
    )

    course.save()

    return Response(course.title, status=status.HTTP_200_OK)
