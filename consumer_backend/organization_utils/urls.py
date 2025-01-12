from django.urls import path
from . import views

urlpatterns = [
    path("create-organization/", views.create_organization, name="create_organization"),
    path("create-member/", views.create_member, name="create_member")
]
