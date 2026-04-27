# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserProfile, SupervisorAssignment, Invitation
from core.api import BaseModelSerializer

class UserProfileSerializer(BaseModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = UserProfile
        fields = [
            'id', 'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'address_line1', 'address_line2',
            'city', 'state', 'country', 'postal_code', 'skills',
            'interests', 'certifications', 'linkedin_url', 'github_url',
            'portfolio_url', 'resume', 'created_at', 'updated_at'
        ]

