from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path("validate-invite/<str:invitation_token>/", views.validate_invite_token, name='validate-invite'),
    path("organization/", OrganizationView.as_view(), name="organization"),
    path("member/", MemberView.as_view(), name="member"),
    path("invite/", InviteMemberView.as_view(), name="invite"),
]
 