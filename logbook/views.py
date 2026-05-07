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

        # Apply query filters
        date_from = self.requests.query_params.get('date_from')
        date_to = self.requests.query_params.get('date_to')
        status = self.requests.query_params.get('status')
        category = self.requests.query_params.get('category')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__Ite=date_to)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)

        return queryset    

    def perform_create(self, serializer):
        log = serializer.save() 

        # Notify supervisor
        asssignment = self.request.user.supervisor_assignments.filter(is_active=True).first()
        if asssignment and asssignment.supervisor:
            NotificationsService.send_notification(
                recepient=asssignment.supervisor,
                category='log_submitted'
                title="New Log Submitted",
                message=f"{self.request.user.get_full_name()} submitted a log for {log.date}.",
                sender=self.request.user,
                data={'log_id': str(log.id)},
                action_url=f"/log/{log.id}",
                action_text="Review Log"
            )   

    @action(detail=True, methods=['post'])
    def submit(self, request, pk= None):
        """Submit log for review"""
        log = self.get_object()

        if log.status != LogEntry.Status.DRAFT:
            return Response(
                {'error': 'Only draft logs can be submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        log.submit()

        # Notify supervisor
        asssignment = self.request.user.supervisor_assignments.filter(is_active=True).first()
        if asssignment and asssignment.supervisor:
            NotificationsService.send_notification(
                recepient=asssignment.supervisor,
                category='log_submitted'
                title="New Log Submitted",
                message=f"{self.request.user.get_full_name()} submitted a log for {log.date}.",
                sender=self.request.user,
                data={'log_id': str(log.id)},
                action_url=f"/log/{log.id}",
                action_text="Review Log"
            )  

        return Response(LogEntrySerializer(log).data)

    @action(detail=True, methods=['post'])
    def review(self, requset, pk=None):
        """Review a log (approve/reject)"""
        log = self.get_object()

        # Check if user is supervisor
        if not requset.user.is_supervisor:
            return Response(
                {'error': 'Only supervisors can review logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(log, data=request.data)
        if serializer.is_valid():
            reviewed_log = serializer.save()

            # Notify intern
            template = (NotificationTemplates.log_approved if reviewed_log.status == 'approved' 
                       else NotificationTemplates.log_rejected)
            
            NotificationService.send_notification(
                recipient=reviewed_log.user,
                category=f'log_{reviewed_log.status}',
                title=f"Log {reviewed_log.status.title()}",
                message=f"Your log for {reviewed_log.date} has been {reviewed_log.status}.",
                sender=request.user,
                notification_type='success' if reviewed_log.status == 'approved' else 'error',
                data={'log_id': str(reviewed_log.id)},
                action_url=f"/logs/{reviewed_log.id}"
            )

            return Response(LogEntrySerializer(reviewed_log).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """Add attachment to log entry"""
        log = self.get_object()

        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attachment = LogAttachment.objects.create(
            log_entry=log,
            file=file,
            filename=file.name,
            file_size=file.size,
            content_type=file.content_type
        )

        return Response(
            LogAttachmentSerializer(attachment).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get log summary for current user"""
        user = request.user
        
        # Date range
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        logs = self.get_queryset()

        
    



        
        
    
              

    

               



    

