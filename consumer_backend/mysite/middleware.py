from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from authentication.models import AuthProfile
from django.contrib.sessions.middleware  import SessionMiddleware
from django.contrib.auth.models import AnonymousUser
import json

@database_sync_to_async
def get_user(auth_profile_id):
    print("auth_profile_id", auth_profile_id)
    try:
        return AuthProfile.objects.get(id=auth_profile_id)
    except AuthProfile.DoesNotExist:
        return AnonymousUser()
    
@database_sync_to_async
def get_session(session):
    pass

class MongoEngineSessionAuthMiddleWare:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        scope.user = None
        query_params = dict(scope['query_string'].decode().split('&'))
        print("whats up gang")
        print(query_params)
        return await self.app(scope, receive, send)
