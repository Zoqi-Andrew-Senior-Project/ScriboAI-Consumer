from rest_framework_mongoengine import serializers
from .models import Course, Module
from django.forms import ValidationError

class CourseSerializer(serializers.DocumentSerializer):
    uuid = serializers.serializers.CharField(read_only=True)
 
    class Meta:
        model = Course
        fields = ['uuid', 'title', 'objectives', 'duration', 'summary']  # Added `uuid`        

class ModuleSerializer(serializers.DocumentSerializer):
    course_uuid = serializers.serializers.CharField(write_only=True)  # Allow input but don't include in response
    order = serializers.serializers.IntegerField(write_only=True)

    class Meta:
        model = Module
        fields = ['name', 'duration', 'subtopics', 'features', 'course_uuid', 'order']

    def create(self, validated_data):
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
    
# class CourseWithModulesSerializer(serializers.DocumentSerializer):
#     course = 