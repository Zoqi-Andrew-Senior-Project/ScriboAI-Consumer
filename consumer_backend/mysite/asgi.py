import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from organization_utils.routing import websocket_urlpatterns
from course_utils import routing as course_routing

# Set environment variables for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

# Setup Django
django.setup()

# Define the ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Standard Django ASGI application
    "websocket": AuthMiddlewareStack(
        URLRouter(
            course_routing.websocket_urlpatterns
        )
    ),
})
