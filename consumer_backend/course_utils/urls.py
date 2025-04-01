from django.urls import path
from .views import *

urlpatterns = [
    path("course/", CourseView.as_view(), name="course"),
    path("pages/", PageView.as_view(), name="pages"),
]
