# logs/admin.py
from django.contrib import admin
from .models import LogEntry, LogAttachment, TimeOff


class LogAttachmentInline(admin.TabularInline):
    model = LogAttachment


admin.site.register(LogEntry)