import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from organization_utils.routing import websocket_urlpatterns
from channels.security.websocket import AllowedHostsOriginValidator
from .middleware import MongoEngineSessionAuthMiddleWare
from channels.sessions import SessionMiddlewareStack

# Set environment variables for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

# Setup Django
django.setup()

# Define the ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Standard Django ASGI application
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            SessionMiddlewareStack(
                URLRouter(
                    websocket_urlpatterns
                )
            )
        )
    ),
})
