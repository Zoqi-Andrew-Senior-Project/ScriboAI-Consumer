from django.urls import path

from . import views

urlpatterns = [
    path("api/index", views.index.as_view(), name="index"),
]