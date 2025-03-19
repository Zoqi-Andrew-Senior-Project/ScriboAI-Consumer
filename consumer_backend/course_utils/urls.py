from django.urls import path
from . import views

urlpatterns = [
    path("create-outline/", views.create_course_outline, name="create_course_outline"),
    path("get-course/", views.get_course, name="get_course"),
]
