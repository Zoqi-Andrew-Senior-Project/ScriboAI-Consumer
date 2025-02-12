from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("organization/", OrganizationView.as_view(), name="organization"),
    path("invite-member/", views.invite_member, name="invite_member"),
    path("validate-invite/<str:invitation_token>/", views.validate_invite_token, name='validate-invite'),
    path("complete-profile/", views.complete_profile, name="complete_profile"),
    path("delete-member/", views.delete_member, name="delete_member"),
    path("member/", MemberView.as_view(), name="member"),
]
 