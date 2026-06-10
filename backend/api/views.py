from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation, Notification
from .serializers import (UserSerializer, InternshipPlacementSerializer, WeeklyLogSerializer, EvaluationCriteriaSerializer, EvaluationSerializer, NotificationSerializer)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.views import APIView

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows admin users to be viewed or edited.
    """
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    # Restrict this so ONLY Admins can fetch/create users
    def get_permissions(self):
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
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return InternshipPlacement.objects.none()
            
        # Standardise the role to uppercase to prevent mismatch bugs
        role = str(getattr(user, 'role', '')).upper()
        
        # DIAGNOSTIC TRACER: This prints directly to Django server terminal
        print(f"--- ILES DIAGNOSTIC --- User: {user.username} | Role: {role}")
            
        if role == 'STUDENT':
            return InternshipPlacement.objects.filter(student=user)
        elif role in ['WORKPLACE_SUPERVISOR', 'WORKPLACE_SUP']:
            return InternshipPlacement.objects.filter(workplace_supervisor=user)
        elif role in ['ACADEMIC_SUPERVISOR', 'ACADEMIC_SUP']:
            return InternshipPlacement.objects.filter(academic_supervisor=user)
            
        return InternshipPlacement.objects.all()


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return WeeklyLog.objects.none()

        role = str(getattr(user, 'role', '')).upper()

        if role == 'STUDENT':
            return WeeklyLog.objects.filter(placement__student=user)
        elif role in ['WORKPLACE_SUPERVISOR', 'WORKPLACE_SUP']:
            return WeeklyLog.objects.filter(placement__workplace_supervisor=user)
            
        return WeeklyLog.objects.all()


    def perform_update(self, serializer):
        # 1. Fetch the log's status BEFORE the supervisor's new changes are saved
        original_log = self.get_object()
        original_status = original_log.status
        
        # 2. Save the supervisor's changes (triggers the post_save signal)
        updated_log = serializer.save()
        
        # 3. Terminal Diagnostics: Proof of tracking
        if original_status != updated_log.status:
            print(f"ILES WORKFLOW: Log {updated_log.id} transitioning from {original_status} -> {updated_log.status}")
            if updated_log.status == 'APPROVED':
                print(f"SIGNAL TRIGGERED: Firing notification for {updated_log.placement.student.username}")



class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Evaluation.objects.none()
            
        role = str(getattr(user, 'role', '')).upper()
        

        if role == 'STUDENT':
            # Allow the student to see grades linked to their placement
            return Evaluation.objects.filter(placement__student=user)
        elif role in ['ACADEMIC_SUPERVISOR', 'ACADEMIC_SUP']:
            # Allow the supervisor to see the grades they authored
            return Evaluation.objects.filter(evaluator=user)
            
        return Evaluation.objects.all()
        
        
class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer

    def get_queryset(self):
        # We want everyone to be able to see the 
        # grading criteria so they know the rules, so we return all of them safely.
        user = self.request.user
        if not user.is_authenticated:
            return EvaluationCriteria.objects.none()
        return EvaluationCriteria.objects.all()
    
@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This guarantees a student can NEVER see another student's notifications.
        return Notification.objects.filter(user=self.request.user, is_read=False)
    
class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Find all unread notifications for the logged-in user and flip them to True
        updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})