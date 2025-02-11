from rest_framework.permissions import BasePermission
from authentication.models import AuthProfile  # Import AuthProfile to access the user's role
from .models import Member  # Import Member to access the user's role

class IsOwner(BasePermission):
    """
    Custom permission to only allow the owner (role "OW") to access certain views.
    """
    def has_permission(self, request, view):
        # Get the authenticated user's profile
        auth_profile = request.user  # Assuming the user is set via your custom authentication

        # Fetch the member's role based on the auth_profile
        member = Member.objects(auth_profile=auth_profile).first()

        # Check if the member's role is "OW" (Owner)
        if member and member.role == "OW":
            return True
        return False


class IsAdmin(BasePermission):
    """
    Custom permission to only allow admins (role "AD") to access certain views.
    """
    def has_permission(self, request, view):
        auth_profile = request.user

        member = Member.objects(auth_profile=auth_profile).first()

        if member and member.role == "AD":
            return True
        return False


class IsEmployee(BasePermission):
    """
    Custom permission to only allow employees (role "EM") to access certain views.
    """
    def has_permission(self, request, view):
        auth_profile = request.user

        member = Member.objects(auth_profile=auth_profile).first()

        if member and member.role == "EM":
            return True
        return False
    
class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to only allow the owner (role "OW") or admins (role "AD") to access certain views.
    """
    def has_permission(self, request, view):
        auth_profile = request.user

        member = Member.objects(auth_profile=auth_profile).first()

        if member and (member.role == "OW" or member.role == "AD"):
            return True
        return False
