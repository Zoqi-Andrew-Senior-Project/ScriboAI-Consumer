import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .scribo_handler import ScriboHandler
from .serializers import CourseWithModulesSerializer, PageSerializer
from .models import Course, Module
import markdown

class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['doc_id']
        self.room_group_name = f"document_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        uuid = self.scope['url_route']['kwargs']['doc_id']

        module = Module.objects.get(uuid=uuid)

        page_serializer = PageSerializer({"currentPage": module.uuid})

        message = {
            "status": "good",
            "data": page_serializer.data
        }

        await self.send(text_data=json.dumps(message))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data["content"]
        response_data = data

        action = data.get("action", None)

        if action == "next":
            nextPage = data.get("nextPage", None)

            if nextPage:
                page_serializer = PageSerializer({"currentPage": nextPage})
                response_data = page_serializer.data
            

        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "document_update",
                "status": "good",
                "data": response_data
            }
        )

    async def document_update(self, event):
        message = {
            "status": event["status"],
            "data": event["data"]
        }
        await self.send(text_data=json.dumps(message))

class DocumentActions():
    def __init__(self):
        self.scribo = ScriboHandler()
    def generate(self):
        md = markdown.Markdown(extensions=["fenced_code"])
        content = md.convert(self.scribo.generate_page())
        return content

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
        print("inside update")
        print(data)
        content = data["script"]
        comments = data.get("comments", "")

        data = {
            "notes":  comments,
            "script": content
        }

        course_outline = self.scribo.update_course_outline(data)

        course_serializer = CourseWithModulesSerializer(data=course_outline)
        
        if course_serializer.is_valid():
            course_serializer.save()
            return course_serializer.data, "good"
        
        return data["script"], "bad"
    
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