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
