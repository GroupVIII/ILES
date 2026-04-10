from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import WeeklyLog, Issue
from .serializers import WeeklyLogSerializer, IssueSerializer, MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class WeeklyLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeeklyLog.objects.filter(placement__student=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

class SupervisorLogListView(generics.ListAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtering for Submitted logs so the Supervisor can act
        if self.request.user.role == 'WORKPLACE_SUP' or self.request.user.is_staff:
            return WeeklyLog.objects.filter(status='SUBMITTED')
        return WeeklyLog.objects.none()

class ApproveLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'WORKPLACE_SUP' and not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            log = WeeklyLog.objects.get(pk=pk)
            log.status = 'APPROVED'
            log.save()
            return Response({"message": "Log approved!"}, status=status.HTTP_200_OK)
        except WeeklyLog.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class IssueListCreateView(generics.ListCreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)