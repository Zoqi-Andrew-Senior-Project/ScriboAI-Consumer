from django.urls import path
#from .views import register_user
from .views import LoginView, LogoutView, ProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
