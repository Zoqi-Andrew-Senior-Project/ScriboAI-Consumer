from rest_framework_mongoengine.serializers import serializers, DocumentSerializer
from .models import Course, Module
from django.forms import ValidationError

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
 
    class Meta:
        model = Course
        fields = ['uuid', 'title', 'objectives', 'duration', 'summary']  # Added `uuid`

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
    
class PageSerializer(DocumentSerializer):
    prevPage = serializers.CharField(read_only=True)
    nextPage = serializers.CharField(read_only=True)
    currentPage = serializers.CharField()
    course = serializers.CharField()
    total = serializers.IntegerField()
    current_order = serializers.IntegerField()
    content = serializers.CharField()

    def validate(self, data):
        if not Module.objects.filter(uuid=data['currentPage']).first():
                raise ValidationError(f"Object with uuid {data['currecurrentPagent']} does not exist!")

    def to_representation(self, instance):
        """Modify how data is serialized and returned"""
        module = Module.objects.filter(uuid=instance["currentPage"]).first()

        course = module.course
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