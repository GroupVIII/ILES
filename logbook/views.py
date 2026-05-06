# logs/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from django.db.models import Q, Sum
from .models import LogEntry, LogAttachment, TimeOff
from .serializers import (
    LogEntrySerializer, LogEntryCreateSerializer, LogEntryUpdateSerializer,
    LogEntryReviewSerializer, TimeOffSerializer, TimeOffCreateSerializer,
    TimeOffReviewSerializer, LogAttachmentSerializer
)
from accounts.models import User
from core.api import MultiSerializerViewSet
from notification.services import NoticationsService, NoticationTemplates
import logging

logger = logging.getLogger(__name__)




