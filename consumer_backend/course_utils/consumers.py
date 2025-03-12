import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .scribo_handler import ScriboHandler
from .serializers import CourseSerializer, ModuleSerializer

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

class OutlineConsumer(AsyncWebsocketConsumer):
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
        content = data["script"]
        
        status = "good"
        if data.get("status"):
            status = data["status"]

        action = ""
        if data.get("action"):
            action = data["action"]

        if action == "update":
            content, status = OutlineActions().update(data)

        if action == "save":
            content = OutlineActions().save(data)


        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "document_update",
                "script": content,
                "status": status
            }
        )
    async def document_update(self, event):
        await self.send(text_data=json.dumps({"script": event["script"],"status": event["status"]}))


class OutlineActions():
    def __init__(self):
        self.scribo = ScriboHandler()

    def update(self, data):
        content = data["script"]

        comments = ""
        if data["comments"]:
            comments = data["comments"]

        data = {
            "notes":  comments,
            "script": content
        }

        content = self.scribo.update_course_outline(data)

        status = "good"
        
        return content, status
    
    def save(self, data):
        content = data["script"]
        status = ""

        course_serializer = CourseSerializer(data=content)

        if course_serializer.is_valid():
            course = course_serializer.save()

            modules = content['modules']

            module_data = []

            order = 0
            for module in modules:
                module['course_uuid'] = course.uuid
                module['order'] = order
                order += 1

                module_serializer = ModuleSerializer(data=module)

                if module_serializer.is_valid():
                    module_instance = module_serializer.save()
                    module_data.append(ModuleSerializer(module_instance).data)

                    status = "good"
                    
                    return content, status
                else:
                    status = "bad"
                    return content, status
        else:
            status = "bad"
            return content, status