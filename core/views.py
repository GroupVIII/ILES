from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation, Notification
from .serializers import (UserSerializer, InternshipPlacementSerializer, WeeklyLogSerializer, EvaluationCriteriaSerializer, EvaluationSerializer, NotificationSerializer)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer