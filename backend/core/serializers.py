from rest_framework import serializers
from .models import Issue, WeeklyLog, InternshipPlacement
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class WeeklyLogSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='placement.student.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WeeklyLog
        fields = [
            'id', 'placement', 'student_name', 'week_number', 
            'activities', 'status', 'status_display', 
            'created_at'
        ]
        read_only_fields = ['status', 'created_at']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'reporter', 'title', 'description', 'issue_type', 'is_resolved', 'created_at']
        read_only_fields = ['reporter', 'created_at']