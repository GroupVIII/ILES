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
