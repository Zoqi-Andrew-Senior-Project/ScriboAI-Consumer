from django.urls import path
from . import views

urlpatterns = [
    path("create-outline/", views.create_course_outline, name="create_course_outline"),
]
