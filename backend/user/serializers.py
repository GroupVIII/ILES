from dataclasses import fields
from user.models import CustomUser
from rest_framework import serializers

class CustomUserSerializers(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'gender', 'department']