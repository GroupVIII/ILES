from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import WeeklyLog
from .serializers import WeeklyLogSerializer # Ensure you have this in serializers.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class WeeklyLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A student should only see logs for their own placement
        return WeeklyLog.objects.filter(placement__student=self.request.user)

    def perform_create(self, serializer):
        # Automatically link the log to the student's active placement
        serializer.save()

class IssueListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
