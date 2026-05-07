# core/api.py
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
import logging

logger = logging.getLogger(__name__)

class BaseModelSerializer(serializers.ModelSerializer):
    """Base serializer with common fields"""
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    id = serializers.UUIDField(read_only=True)

class MultiSerializerViewSet(viewsets.ModelViewSet):
    """
    ViewSet that allows different serializers for different actions.
    """
    serializer_classes = {}
    
    def get_serializer_class(self):
        try:
            return self.serializer_classes[self.action]
        except (KeyError, AttributeError):
            return super().get_serializer_class()

class ActionBasedPermission(permissions.BasePermission):
    """
    Permission that allows different permissions for different actions.
    """
    def has_permission(self, request, view):
        action_permissions = getattr(view, 'action_permissions', {})
        action = getattr(view, 'action', None)

        if action in action_permissions:
            permissions_classes = action_permissions[action]
        else:
            permissions_classes = view.permission_classes
        for permission_class in permissions_classes:
            if not permission_class().has_permission(request, view):
                return False
        return True
        
