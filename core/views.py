from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import WeeklyLog
from .serializers import WeeklyLogSerializer # Ensure you have this in serializers.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ApproveLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # 1. Security Check: Is the user actually a Supervisor?
        if request.user.role != 'SUPERVISOR':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            log = WeeklyLog.objects.get(pk=pk)
            log.status = 'APPROVED' # The "Divine Stamp"
            log.save()
            return Response({"message": "Log approved successfully!"}, status=status.HTTP_200_OK)
        except WeeklyLog.DoesNotExist:
            return Response({"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND)
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

class SupervisorLogListView(generics.ListAPIView):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow access if the user is a SUPERVISOR
        if self.request.user.role == 'SUPERVISOR':
            return WeeklyLog.objects.filter(status='SUBMITTED')
        return WeeklyLog.objects.none() # Students see nothing here
