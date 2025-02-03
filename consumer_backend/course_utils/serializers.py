from rest_framework import serializers
from .models import CourseOutline

class CourseOutlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseOutline
        fields = ['title', 'objectives', 'duration', 'modules', 'summary', 'organization']