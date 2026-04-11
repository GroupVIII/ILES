from django.shortcuts import render
from rest_framework import viewsets
from user.models import CustomUser
from user.serializers import CustomUserSerializers
# Create your views here.

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializers
    permission_class = ['rest_framework.permissions.IsAuthenticated']