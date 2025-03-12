from django.urls import re_path
from .consumers import DocumentConsumer

websocket_urlpatterns = [
    re_path(r"ws/document/(?P<doc_id>\w+)/$", DocumentConsumer.as_asgi()),
]
