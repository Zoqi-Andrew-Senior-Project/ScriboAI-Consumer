from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("course/", CourseView.as_view(), name="course"),
    path("get-page/", views.get_page, name="get_page"),
    path("initialize-pages/", views.initialize_pages, name="initialize_pages")
]
