from django.urls import path
#from .views import register_user
from .views import LoginView, LogoutView, ProfileView, get_csrf_token

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('csrf/', get_csrf_token, name='csrf'),
]
