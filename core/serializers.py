from rest_framework import serializers
from .models import Issue
from .models import Issue, WeeklyLog, InternshipPlacement

class WeeklyLogSerializer(serializers.ModelSerializer):
    # These 'ReadOnly' fields pull extra info without needing extra API calls
    student_name = serializers.ReadOnlyField(source='placement.student.get_full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WeeklyLog
        fields = [
            'id', 'placement', 'student_name', 'week_number', 
            'activities', 'challenges', 'status', 'status_display', 
            'created_at'
        ]
        # We make 'status' read-only for students so they can't 'Approve' their own logs!
        read_only_fields = ['status', 'created_at']

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        # We include these fields so the React frontend knows what to display
        fields = ['id', 'reporter', 'title', 'description', 'issue_type', 'is_resolved', 'created_at']
        read_only_fields = ['reporter', 'created_at']
        
