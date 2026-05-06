# logs/admin.py
from django.contrib import admin
from .models import LogEntry, LogAttachment, TimeOff


class LogAttachmentInline(admin.TabularInline):
    model = LogAttachment
    extra = 0
    readonly_fields = ('filename', 'file_size', 'context_type')


@admin.site.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'hours', 'category', 'status', 'created_at')
    

