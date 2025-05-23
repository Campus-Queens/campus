import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "campus_backend.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from chat_messages.routing import websocket_urlpatterns
from appuser.middleware import TokenAuthMiddleware  # <- your custom JWT middleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
