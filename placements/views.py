# placements/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Department, Placement, PlacementHistory, Rotation
from .serializers import (
    DepartmentSerializer, PlacementSerializer, PlacementCreateSerializer,
    PlacementUpdateSerializer, PlacementHistorySerializer, RotationSerializer
)
from core.api import MultiSerializerViewSet
from accounts.models import User
from notifications.services import NotificationService
import logging

logger = logging.getLogger(__name__)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments.
    """
    queryset = Department.objects.filter(is_deleted=False)
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin_or_hr:
            return Department.objects.all()
        return Department.objects.filter(is_active=True)
    
    @action(detail=True, methods=['get'])
    def placements(self, request, pk=None):
        """Get all placements in this department"""
        department = self.get_object()
        placements = Placement.objects.filter(department=department)
        serializer = PlacementSerializer(placements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def active_interns(self, request, pk=None):
        """Get active interns in this department"""
        department = self.get_object()
        active_placements = Placement.objects.filter(
            department=department,
            status__in=['active', 'extended']
        )
        interns = [p.intern for p in active_placements]
        from accounts.serializers import UserSerializer
        serializer = UserSerializer(interns, many=True)
        return Response(serializer.data)


class PlacementViewSet(MultiSerializerViewSet):
    """
    ViewSet for managing placements.
    """
    queryset = Placement.objects.filter(is_deleted=False)
    serializer_classes = {
        'create': PlacementCreateSerializer,
        'update': PlacementUpdateSerializer,
        'partial_update': PlacementUpdateSerializer,
        'list': PlacementSerializer,
        'retrieve': PlacementSerializer,
        'history': PlacementHistorySerializer,
    }
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_or_hr:
            return Placement.objects.all()
        elif user.is_supervisor:
            # Supervisors see placements they supervise
            return Placement.objects.filter(
                Q(supervisors=user) | Q(created_by=user)
            ).distinct()
        else:
            # Interns see only their own placements
            return Placement.objects.filter(intern=user)
    
    def perform_create(self, serializer):
        placement = serializer.save()
        
        # Notify intern
        NotificationService.send_notification(
            recipient=placement.intern,
            category='placement_created',
            title="New Placement Created",
            message=f"You have been placed in {placement.department.name} as {placement.title}.",
            sender=self.request.user,
            notification_type='success',
            data={'placement_id': str(placement.id)},
            action_url=f"/placements/{placement.id}",
            action_text="View Placement"
        )
        
        # Notify supervisors
        for supervisor in placement.supervisors.all():
            NotificationService.send_notification(
                recipient=supervisor,
                category='placement_supervisor',
                title="New Intern Assigned",
                message=f"{placement.intern.get_full_name()} has been assigned to your department.",
                sender=self.request.user,
                data={'placement_id': str(placement.id)},
                action_url=f"/placements/{placement.id}",
                action_text="View Placement"
            )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a placement"""
        placement = self.get_object()
        
        if placement.status != 'pending':
            return Response(
                {'error': 'Only pending placements can be activated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        placement.status = 'active'
        placement.save()
        
        # Notify intern
        NotificationService.send_notification(
            recipient=placement.intern,
            category='placement_activated',
            title="Placement Activated",
            message=f"Your placement in {placement.department.name} has been activated.",
            sender=request.user,
            notification_type='success',
            data={'placement_id': str(placement.id)}
        )
        
        return Response(PlacementSerializer(placement).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a placement"""
        placement = self.get_object()
        placement.complete()
        
        # Notify intern
        NotificationService.send_notification(
            recipient=placement.intern,
            category='placement_completed',
            title="Placement Completed",
            message=f"Your placement in {placement.department.name} has been completed.",
            sender=request.user,
            notification_type='info',
            data={'placement_id': str(placement.id)}
        )
        
        return Response(PlacementSerializer(placement).data)
    
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        """Extend a placement"""
        placement = self.get_object()
        new_end_date = request.data.get('end_date')
        
        if not new_end_date:
            return Response(
                {'error': 'New end date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        placement.extend(new_end_date)
        
        # Notify intern
        NotificationService.send_notification(
            recipient=placement.intern,
            category='placement_extended',
            title="Placement Extended",
            message=f"Your placement has been extended until {new_end_date}.",
            sender=request.user,
            notification_type='info',
            data={'placement_id': str(placement.id)}
        )
        
        return Response(PlacementSerializer(placement).data)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get placement history"""
        placement = self.get_object()
        history = PlacementHistory.objects.filter(placement=placement)
        serializer = PlacementHistorySerializer(history, many=True)
        return Response(serializer.data)
