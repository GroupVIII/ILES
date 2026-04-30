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
        fields = ['log_entry']
        fields +=['file']
        fields +=['file_url']
        fields +=['filename']
        fields +=['file_size']
        fields +=['content_type']
        fields +=['uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
class LogEntrySerializer(BaseModelSerializer):        
            
                
        







