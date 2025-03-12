import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['doc_id']
        self.room_group_name = f"document_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data["content"]

        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "document_update",
                "content": content
            }
        )

    async def document_update(self, event):
        await self.send(text_data=json.dumps({"content": event["content"]}))
