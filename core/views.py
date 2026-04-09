from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WeeklyLog, Issue
from .serializers import WeeklyLogSerializer, IssueSerializer

# The custom serializer to put user data INTO the token
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role # This allows Dashboard.jsx to see the role immediately
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny] # Ensure anyone can attempt a login
    serializer_class = MyTokenObtainPairSerializer

class ApproveLogView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Security: Only supervisors can approve
        if request.user.role != 'WORKPLACE_SUP':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            log = WeeklyLog.objects.get(pk=pk)
            log.status = 'APPROVED'
            log.save()
            return Response({"message": "Log approved successfully!"}, status=status.HTTP_200_OK)
        except WeeklyLog.DoesNotExist:
            return Response({"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND)

class WeeklyLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeeklyLog.objects.filter(placement__student=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

class IssueListCreateView(generics.ListCreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class SupervisorLogListView(generics.ListAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'WORKPLACE_SUP':
            return WeeklyLog.objects.filter(status='SUBMITTED')
        return WeeklyLog.objects.none()