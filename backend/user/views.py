from django.shortcuts import render
from rest_framework import viewsets, permissions
from user.models import CustomUser
from user.serializers import CustomUserSerializers
# Create your views here.

# from rest_framework import permissions

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializers
    permission_classes = [permissions.IsAuthenticated]