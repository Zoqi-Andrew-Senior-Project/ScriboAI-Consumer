import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class MyConsumer(WebsocketConsumer):
    http_user = True
    random = 0

    def connect(self):
        async_to_sync(self.channel_layer.group_add)(
            'test',
            self.channel_name
        )

        self.random = 14

        self.accept()
        self.send(text_data=json.dumps({
            'message': 'Connected!',
        }))
    
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            'test',
            self.channel_name
        )
    
    def receive(self, text_data):
        # if text_data == 'ping':
        #     self.send(text_data='pong')
        # elif text_data == 'user':
        #     self.send(text_data=f"User: {message.user}")
        # else:
        #     self.send(text_data=f"Message received: {text_data}")

        async_to_sync(self.channel_layer.group_send)(
            'test',
            {
                'type': 'chat_message',
                'message': text_data
            }
        )

        if text_data == 'ping':
            self.send(text_data='pong')
        elif text_data == 'user':
            self.send(text_data=f"User:{self.scope['user']}")
        elif text_data == 'session':
            self.send(text_data=f"Session:{self.scope['session']}")
        elif text_data == 'scope':
            self.send(text_data=f"{self.scope}")
        elif text_data == 'random':
            self.send(text_data=f"{self.random}")
        else:
            self.send(text_data=f"Message received: {text_data}")

    def chat_message(self, event):
        self.send(text_data=event['message'])