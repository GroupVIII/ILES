# core/api.py
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
import logging