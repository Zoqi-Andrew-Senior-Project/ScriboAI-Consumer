from django.urls import re_path
from .consumers import DocumentConsumer, OutlineConsumer

websocket_urlpatterns = [
    re_path(r"ws/document/(?P<doc_id>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/$", DocumentConsumer.as_asgi()),
    re_path(r"ws/outline/(?P<cor_uuid>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/$", OutlineConsumer.as_asgi()),]
