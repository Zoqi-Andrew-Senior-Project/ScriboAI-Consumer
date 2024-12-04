from django.urls import path
from .views import RegisterView, LoginView

urlpatterns = [
    path('api/authentication/register/', RegisterView.as_view(), name='register'),
    path('api/authentication/login/', LoginView.as_view(), name='login'),
]
