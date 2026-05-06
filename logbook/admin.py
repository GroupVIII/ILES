# logs/admin.py
from django.contrib import admin
from .models import LogEntry, LogAttachment, TimeOff





admin.site.register(LogEntry)