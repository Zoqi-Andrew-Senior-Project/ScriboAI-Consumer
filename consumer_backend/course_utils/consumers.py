import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .scribo_handler import ScriboHandler
from .serializers import CourseWithModulesSerializer, PageSerializer, ModuleSerializer
from .models import Course, Module, StatusEnum
import markdown
import redis
from django.conf import settings

redis_client = redis.StrictRedis.from_url(
    settings.CACHES["default"]["LOCATION"], decode_responses=True
)


class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["doc_id"]
        self.room_group_name = f"document_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        uuid = self.scope["url_route"]["kwargs"]["doc_id"]

        cached_data = redis_client.get(f"page:{uuid}")
        cached_data = json.loads(cached_data) if cached_data else {}

        if cached_data:
            page_data = cached_data
        else:
            course = Course.objects.get(uuid=uuid)
            page_serializer = PageSerializer({"course": course.uuid})
            page_data = page_serializer.data

            redis_client.set(f"page:{uuid}", json.dumps(page_data))

        message = {
            "status": "good",
            "data": {
                "content": page_data.pop("content"),
            },
            "meta": page_data,
        }

        await self.send(text_data=json.dumps(message))

    async def disconnect(self, close_code):
        redis_client.delete(f"page:{self.room_name}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        response_data = data.get("data", {})

        action = data.get("action", None)

        cached_data: dict = json.loads(redis_client.get(f"page:{self.room_name}"))

        if action == "next" and cached_data.get("nextPage"):
            page_serializer = PageSerializer(
                {"currentPage": cached_data.get("nextPage")}
            )
            response_data = page_serializer.data

            # Update in Redis
            redis_client.set(f"page:{self.room_name}", json.dumps(response_data))

        if action == "back" and cached_data.get("prevPage", None):
            page_serializer = PageSerializer(
                {"currentPage": cached_data.get("prevPage")}
            )
            response_data = page_serializer.data

            # Update in Redis
            redis_client.set(f"page:{self.room_name}", json.dumps(response_data))

        if action == "save":
            cached_data = json.loads(redis_client.get(f"page:{self.room_name}"))

            try:
                module = Module.objects.get(uuid=cached_data.get("currentPage"))
                module["content"] = cached_data.get("content")
                module.save()
            except Module.DoesNotExist:
                print(f'No module matched with uuid {cached_data.get("currentPage")}')

        if action == "clear":
            redis_client.delete(f"page:{self.room_name}")

            await self.send(text_data=json.dumps({"status": "cleared"}))
            return

        if action == None and response_data:
            cached_data["content"] = response_data["content"]
            response_data = cached_data
            redis_client.set(f"page:{self.room_name}", json.dumps(cached_data))

        if not response_data.get("content", None):
            response_data["content"] = cached_data.get("content")

        response_data["currentPage"] = cached_data.get("currentPage")

        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "document_update",
                "status": "good",
                "data": {
                    "content": response_data.pop("content"),
                },
                "meta": response_data,
            },
        )

    async def document_update(self, event):
        message = {
            "status": event["status"],
            "data": event["data"],
            "meta": event["meta"],
        }
        await self.send(text_data=json.dumps(message))


class DocumentActions:
    def __init__(self):
        self.scribo = ScriboHandler()

    def generate(self):
        md = markdown.Markdown(extensions=["fenced_code"])
        content = md.convert(self.scribo.generate_page())
        return content


class OutlineConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["cor_uuid"]
        self.room_group_name = f"course_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        uuid = self.scope["url_route"]["kwargs"]["cor_uuid"]

        cached_data = redis_client.get(f"course:{uuid}")
        cached_data = json.loads(cached_data) if cached_data else {}

        if cached_data:
            course_data = cached_data
        else:
            course = Course.objects.get(uuid=uuid)
            serialized = CourseWithModulesSerializer(course)
            course_data = serialized.data

            redis_client.set(f"course:{uuid}", json.dumps(course_data))

        message = {"status": "good", "data": {"script": course_data}}

        # Sends back the current state of the outline
        await self.send(text_data=json.dumps(message))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Data:

        {
            "status": "good" | "bad",
            "action": "update" | "save" | "change" | null,
            "data": {
                "changes": {},
                "comments": str | null
            }
        }
        """
        data = json.loads(text_data)
        cached_data: dict = json.loads(redis_client.get(f"course:{self.room_name}"))
        status = "good"
        content = None

        action = data.get("action", "")

        if action == "change" and data.get("data", {}).get("changes", None):
            changes = data.get("data", {}).get("changes", None)

            message = {"original": cached_data, "changes": changes}
            content, status = OutlineActions().change(message)

        if action == "update" and data.get("data", {}).get("comments", None):
            """
            Makes a change to in-memory outline
            """
            messsage = {
                "script": cached_data,
                "comments": data.get("data", {}).get("comments", None),
            }
            content, status = OutlineActions().update(messsage)

        if action == "save":
            """
            Saves the state of in-memory outline to the db
            """
            message = {
                "script": cached_data,
            }
            content, status = OutlineActions().save(message)

        if content:
            redis_client.set(f"course:{self.room_name}", json.dumps(content))
        else:
            content = cached_data

        # Broadcast changes to all users in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "outline_update", "script": content, "status": status},
        )

    async def outline_update(self, event):
        message = {"status": event["status"], "data": {"script": event["script"]}}
        await self.send(text_data=json.dumps(message))


class OutlineActions:
    def __init__(self):
        self.scribo = ScriboHandler()

    def update(self, data):
        """
        Makes a Call to SCRIBO to update the course outline
        """
        content = data["script"]
        comments = data.get("comments", "")

        data = {"notes": comments, "script": content}

        course_outline = self.scribo.update_course_outline(data)

        message = {"original": content, "changes": course_outline}

        updated, status = self.change(message)

        return updated, status

    def save(self, data):
        """
        Saves the outline to the db
        """
        content = data["script"]

        course_serializer = CourseWithModulesSerializer(
            data=content, context={"action": "update"}
        )

        if course_serializer.is_valid():
            course_uuid = course_serializer.validated_data["uuid"]

            try:
                course = Course.objects.get(uuid=course_uuid)
            except Course.DoesNotExist:
                return content, "bad"

            updated_course = course_serializer.update(course, content)
            updated_course["status"] = StatusEnum.DRAFT.value
            updated_course.save()

            content = course_serializer.data

            return content, "good"
        else:
            print(course_serializer.errors)
            return content, "bad"

    def change(self, data):
        """
        Makes changes to data.
        Data:
        {
            original: Outline,
            changes: Partial<Outline & moduleChanges{"add":[Module], "remove":[Module.uuid], "update":[Module]}>
        }
        """
        original = data.get("original", None)
        changes = data.get("changes", None)

        modulesChanges = changes.pop("moduleChanges", None)

        if modulesChanges:
            # add new module
            if "add" in modulesChanges:
                if original["modules"]:
                    original["modules"].extend(modulesChanges["add"])
                else:
                    original["modules"] = modulesChanges["add"]

            # remove module
            if "remove" in modulesChanges:
                original["modules"] = [
                    module
                    for module in original["modules"]
                    if module.get("uuid", False) not in modulesChanges["remove"]
                ]

            # update existing module
            if "update" in modulesChanges:
                for changed_module in modulesChanges["update"]:
                    module_index = next(
                        (
                            index
                            for index, module in enumerate(original["modules"])
                            if module["uuid"] == changed_module["uuid"]
                        ),
                        None,
                    )
                    if module_index is not None:
                        original["modules"][module_index] = changed_module

        # update keys where original matches with changes
        for key in original:
            if key in changes:
                original[key] = changes[key]

        return original, "good"

