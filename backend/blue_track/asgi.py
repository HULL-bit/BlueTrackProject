"""
ASGI config for BLUE-TRACK project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apps.communication.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.communication.routing.websocket_urlpatterns
        )
    ),
})