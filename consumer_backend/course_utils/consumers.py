import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .scribo_handler import ScriboHandler
from .serializers import CourseWithModulesSerializer
from .models import Course

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

        self.room_name = self.scope['url_route']['kwargs']['cor_uuid']
        self.room_group_name = f"course_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        uuid = self.scope['url_route']['kwargs']['cor_uuid']

        course = Course.objects.get(uuid=uuid)

        serialized = CourseWithModulesSerializer(course)

        message = {
            "status": "good",
            "data": {
                "script": serialized.data
            }
        }
        
        # Sends back the current state of the outline
        await self.send(text_data=json.dumps(message))
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Data:

        {
            "status": "good" | "bad",
            "action": "update" | "save" | null,
            "data": {
                "script": {},
                "comments": str | null
            }        
        }
        """
        data = json.loads(text_data)

        content = data["data"]["script"]
        status = "good"
        action = data.get("action", "")

        if action == "update":
            """
            Makes a change to in-memory outline
            """
            content, status = OutlineActions().update(data["data"])

        if action == "save":
            """
            Saves the state of in-memory outline to the db
            """
            content, status = OutlineActions().save(data["data"])


        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "outline_update",
                "script": content,
                "status": status
            }
        )
    async def outline_update(self, event):
        message = {
            "status": event["status"],
            "data": {
                "script": event["script"]
            }
        }
        await self.send(text_data=json.dumps(message))


class OutlineActions():
    def __init__(self):
        self.scribo = ScriboHandler()

    def update(self, data):
        """
        Makes a Call to SCRIBO to update the course outline
        """
        content = data["script"]
        comments = data.get("comments", "")

        data = {
            "notes":  comments,
            "script": content
        }

        content = self.scribo.update_course_outline(data)
        
        return content, "good"
    
    def save(self, data):
        """
        Saves the outline to the db
        """
        content = data["script"]

        course_serializer = CourseWithModulesSerializer(data=content, context={'action': 'update'})

        if course_serializer.is_valid():
            course_uuid = course_serializer.validated_data['uuid']

            try:
                course = Course.objects.get(uuid=course_uuid)
            except Course.DoesNotExist:
                return content, "bad"
            
            updated_course = course_serializer.update(course, content)
            updated_course.save()

            content = course_serializer.data

            return content, "good"
        else:
            print(course_serializer.errors)
            return content, "bad"