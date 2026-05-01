from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation, Notification
from .serializers import (UserSerializer, InternshipPlacementSerializer, WeeklyLogSerializer, EvaluationCriteriaSerializer, EvaluationSerializer, NotificationSerializer)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows admin users to be viewed or edited.
    """
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    # We should restrict this so ONLY Admins can fetch/create users
    def get_permissions(self):
        # We can enforce basic authentication here. 
        # In a fully strict system, you'd check `self.request.user.role == 'ADMIN'`
        return [permissions.IsAuthenticated()]
    
class IsRole(permissions.BasePermission):
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def __call__(self):
        return self

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)
    
class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer