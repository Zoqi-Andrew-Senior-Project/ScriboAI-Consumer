from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("create-organization/", views.create_organization, name="create_organization"),
    path("delete-organization/", views.delete_organization, name="delete_organization"),
    path("invite-member/", views.invite_member, name="invite_member"),
    path("validate-invite/<str:invitation_token>/", views.validate_invite_token, name='validate-invite'),
    path("complete-profile/", views.complete_profile, name="complete_profile"),
    path("delete-member/", views.delete_member, name="delete_member"),
    path("member/", MemberView.as_view(), name="member"),
]
 