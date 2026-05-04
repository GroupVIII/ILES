from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation
from django.contrib.auth.hashers import make_password
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta: