# logs/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import LogEntry, LogAttachment, TimeOff
from accounts.serializers import UserSerializer
from core.api import BaseModelSerializer


class LogAttachmentSerializer(BaseModelSerializer):
    """Serializer for log attachments"""
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = LogAttachment
        fields = [
            'id', log_entry', 'file', 'file_url', 'filename',
            'file_size', 'content_type', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    
class LogEntrySerializer(BaseModelSerializer):
    """Serializers for log entries"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    attachments = LogAttachmentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = LogEntry
        fields = [
            'id', 'user','user_name', 'user_email', 'date',
            'start_time', 'end_time', 'hours', 'title', 'descrption',
            'category', 'category_display', 'tags', 'status', 'status_display',
            'reviewed_by', 'reviewed_at' 'review_comments', 'project_code',
            'is_billable', 'attachments', 'created_at', 'updated_at' 
        ]
        read_only_fields = ['reviewed_by', 'reviewed_at', 'created_at', 'updated_at']


class LogEntryCreateSerializer(BaseModelSerializer):
    """Serializer for creating log entries"""

    class Meta:
        model = LogEntry
        fields = [
            'date', 'start_time', 'end_time', 'hours', 'title',
            'description', 'category', 'tags', 'project_code', 'is_billable'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = LogEntry.Status.DRAFT
        return super().create(validated_data)
    

class LogEntryUpdateSerializer(BaseModelSerializer):
    """Serializer for updating log entries"""

    class Meta:
        model = LogEntry
        fields = [
            'start_time', 'end_time', 'hours', 'title', 'description',
             'category', 'tags', 'project_code', 'is_billable'        
        ]


class LogEntryReviweSerializer(BaseModelSerializer):
    """Serializer for reviewing log entries"""

    class Meta:
        model = LogEntry
        fields = ['status', 'review_comments']

    def validate_status(self, value):
        if value not in [LogEntry.Status.APPROVED, LogEntry.Status.REJECTED]:
            raise serializers.ValidationError("Status must be either 'approved' or 'rejected'")
        
            
        


        




        


        







