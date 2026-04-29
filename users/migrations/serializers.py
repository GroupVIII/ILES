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

class UserSerializer(BaseModelSerializer):
    """Serializer for user model"""
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    internship_status = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'middle_name',
            'full_name', 'role', 'role_display', 'phone_number', 'gender',
            'date_of_birth', 'employee_id', 'department', 'position',
            'university', 'major', 'graduation_year', 'profile_picture',
            'bio', 'start_date', 'end_date', 'total_required_hours',
            'internship_status', 'days_remaining', 'email_notifications',
            'in_app_notifications', 'theme_preference', 'language',
            'timezone', 'is_active', 'date_joined', 'last_login',
            'profile', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_internship_status(self, obj):
        return obj.internship_status

