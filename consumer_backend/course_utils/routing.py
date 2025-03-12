from django.urls import re_path
from .consumers import DocumentConsumer, OutlineConsumer

websocket_urlpatterns = [
    re_path(r"ws/document/(?P<doc_id>\w+)/$", DocumentConsumer.as_asgi()),
    re_path(r"ws/outline/(?P<doc_id>\w+)/$", OutlineConsumer.as_asgi()),
]
