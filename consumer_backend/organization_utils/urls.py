from django.urls import path
from . import views

urlpatterns = [
    path("create-organization/", views.create_organization, name="create_organization"),
    path("delete-organization/", views.delete_organization, name="delete_organization"),
    path("invite-member/", views.invite_member, name="invite_member"),
    path("join-organization/<str:invitation_token>/", views.create_member_by_token, name='join-organization'),
    path("complete-profile/", views.complete_profile, name="complete_profile"),
    path("delete-member/", views.delete_member, name="delete_member"),
]
 