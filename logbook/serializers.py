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
        



