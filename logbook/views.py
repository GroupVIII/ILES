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


class LogEntryViewSet(MultiSerializerViewSet):
    """
    ViewSet for managing log entries.
    """
    queryset = LogEntry.Objects.filter(is_deleted=False)
    serializer_classes = {
        'create': LogEntryCreateSerializer,
        'update': LogEntryUpdateSerializer,
        'partial_update': LogEntryUpdateSerializer,
        'list': LogEntrySerializer,
        'retrieve': LogEntrySerializer,
        'review': LogEntryReviewSerializer,
    }
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Base queryset
        queryset = LogEntry.objects.filters(is_deleted=False)

        # Filter by user role
        if user.is_intern:
            # Interns see only their own logs
            queryset = queryset.filter(user=user)
        elif user.is_supervisor:
            # Supervisors see logs of their interns
            Interns_ids = user.supervising_assignments.filter(
                is_active=True
            ).values_list('Intern_id', flat=True)
            queryset = queryset.filter(user__in-Interns_ids)
            



    

