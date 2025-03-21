from rest_framework_mongoengine.serializers import serializers, DocumentSerializer
from .models import Course, Module, StatusEnum
from django.forms import ValidationError
from rest_framework import serializers as rf_serializers

class BaseSerializer(DocumentSerializer):
    """ Base Serializer that over rights the update and validate functions
    """
    def update(self, instance, validated_data):
        """ Updates an existing instance
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def validate(self, data):
        """ Validates that the data has a uuid for the model
        """
        model = self.Meta.model

        if model is None:
            raise ValidationError("Model class is not provided in the context!")
        
        if self.context.get('action') == 'update':
            if 'uuid' not in data:
                raise ValidationError("UUID is required for updating this object!")
                        
            if not model.objects.filter(uuid=data['uuid']).first():
                raise ValidationError(f"Object with uuid {data['uuid']} does not exist!")
        return data

class CourseSerializer(BaseSerializer):
    uuid = serializers.CharField(required=False)
    status = serializers.CharField(required=False, allow_null=True)
 
    class Meta:
        model = Course
        fields = ['uuid', 'title', 'objectives', 'duration', 'summary', 'status']  # Added `uuid`

    def create(self, validated_data):
        """
        Override the create method to ensure the status is set to `StatusEnum.TEMP` if not provided.
        """
        # Check if 'status' is in validated_data, if not, set it to StatusEnum.TEMP
        status = validated_data.get('status', StatusEnum.TEMP.value)

        # Ensure the status is valid
        if status not in [StatusEnum.TEMP.value, StatusEnum.DRAFT.value, StatusEnum.PUBLISH.value]:
            raise serializers.ValidationError({"status": "Invalid status value"})

        validated_data['status'] = status  # Set the validated status

        # Call the parent class's create method to create the course instance

        return super().create(validated_data)
    
    def validate(self, data):
        return super().validate(data)
    
class ModuleSerializer(BaseSerializer):
    uuid = serializers.CharField(required=False)
    course_uuid = serializers.CharField(write_only=True, required=False)  # Allow input but don't include in response
    order = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Module
        fields = ['uuid', 'name', 'duration', 'subtopics', 'features', 'course_uuid', 'order']

    def to_internal_value(self, data):
        """
        Modify incoming data before validation.
        """
        data = super().to_internal_value(data)  # Let DRF handle standard conversion
        
        # Provide defaults to avoid validation errors
        data.setdefault('course_uuid', None)
        data.setdefault('order', None)

        return data

    def create(self, validated_data):
        """
        Create the module and attach it to the course.
        """
        course_uuid = validated_data.pop('course_uuid')
        order = validated_data.pop('order')

        try:
            course = Course.objects.get(uuid=course_uuid)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course_uuid": "Course not found"})

        # Attach the course reference to the module
        validated_data['course'] = course
        validated_data['order'] = order

        return super().create(validated_data)
    
class CourseWithModulesSerializer(CourseSerializer):
    modules = ModuleSerializer(many=True, required=False)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['modules']


    def create(self, validated_data):
        """
        Create the course and all its modules.
        """
        modules_data = validated_data.pop('modules', [])
        course = super().create(validated_data)

        for i, module_data in enumerate(modules_data):
            module_data['course_uuid'] = course.uuid
            module_data['order'] = i
            ModuleSerializer(context=self.context).create(module_data)

        return course
    
    def update(self, instance, validated_data):
        """
        Update the course and all its modules.
        If a module is not included in the request, it will be deleted.
        """
        modules_data = validated_data.pop('modules', [])
        course = super().update(instance, validated_data)

        existing_modules = {module.uuid: module for module in Module.objects.filter(course=course)}

        updated_module_uuids = []

        for module_data in modules_data:
            updated_module_uuids.append(module_data.get("uuid"))
            if 'uuid' in module_data:
                module_uuid = module_data.pop('uuid')
                if module_uuid in existing_modules:
                    module = existing_modules[module_uuid]
                    module_data['course_uuid'] = course.uuid
                    ModuleSerializer(context=self.context).update(module, module_data)
                else:
                    raise ValidationError(f"Module with uuid {module_uuid} does not exist for this course!")
            else:
                module_data['course_uuid'] = course.uuid
                ModuleSerializer(context=self.context).create(module_data)

        for module in Module.objects.filter(course = course):
            if module.uuid not in updated_module_uuids:
                module.delete()

        return course
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Fetch modules, order by 'order', and serialize them, if the representation wasn't provided with a modules field
        if not 'modules' in representation.keys():
            representation['modules'] = ModuleSerializer(
                Module.objects.filter(course=instance).order_by('order'), many=True
            ).data

        return representation
    
class PageSerializer(rf_serializers.Serializer):
    prevPage = serializers.CharField(read_only=True)
    nextPage = serializers.CharField(read_only=True)
    currentPage = serializers.CharField(default=None)
    course = serializers.CharField(default=None)
    total = serializers.IntegerField(default=None)
    current_order = serializers.IntegerField(default=None)
    content = serializers.CharField(default=None)

    def validate(self, data):
        if not (data.get("course", None) or data.get("currentPage")):
            raise ValidationError("'course' or 'currentPage' values are not provided.")
        
        if data.get("course", None) and not Course.objects.filter(uuid=data.get("course")).first():
            raise ValidationError(f"Course with uuid {data['course']} does not exist!")
        
        if data.get("currentPage", None) and not Module.objects.filter(uuid=data['currentPage']).first():
            raise ValidationError(f"Object with uuid {data['currentPage']} does not exist!")
        
        return data

    def to_representation(self, instance):
        """Modify how data is serialized and returned"""

        print(instance)

        if instance.get("currentPage", None):
            module = Module.objects.filter(uuid=instance["currentPage"]).first()
            course = module.course
        if instance.get("course", None):
            course = Course.objects.get(uuid=instance["course"])
            module: dict = Module.objects.filter(course=course).order_by('order').first()

        prev_module = Module.objects.filter(course=course, order=module.order - 1).first()
        next_module = Module.objects.filter(course=course, order=module.order + 1).first()

        return {
            "prevPage": prev_module.uuid if prev_module else None,
            "nextPage": next_module.uuid if next_module else None,
            "currentPage": module.uuid,
            "course": course.uuid,
            "total": Module.objects.filter(course=course).count(),
            "current_order": (module.order + 1),
            "content": module.content
        }