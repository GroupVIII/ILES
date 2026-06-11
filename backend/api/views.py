from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation, Notification
from .serializers import (UserSerializer, InternshipPlacementSerializer, WeeklyLogSerializer, 
                          EvaluationCriteriaSerializer, EvaluationSerializer, NotificationSerializer, 
                          CustomTokenObtainPairSerializer)

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated: return InternshipPlacement.objects.none()
        role = str(getattr(user, 'role', '')).upper()
        if role == 'STUDENT': return InternshipPlacement.objects.filter(student=user)
        return InternshipPlacement.objects.all()

class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated: return WeeklyLog.objects.none()
        role = str(getattr(user, 'role', '')).upper()
        if role == 'STUDENT': return WeeklyLog.objects.filter(placement__student=user)
        return WeeklyLog.objects.all()

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

class EvaluationCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriteria.objects.all()
    serializer_class = EvaluationCriteriaSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)
    
class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})