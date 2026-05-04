from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation
from django.contrib.auth.hashers import make_password
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            role=validated_data.get('role', 'STUDENT'),
            password=make_password(validated_data['password'])