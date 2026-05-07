from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation
from django.contrib.auth.hashers import make_password
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'role']
        # Ensure password isn't exposed in GET requests
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Hash the password before saving, otherwise they can't log in.
        user = CustomUser.objects.create(
            username=validated_data['username'],
            role=validated_data.get('role', 'STUDENT'),
            password=make_password(validated_data['password'])
        )
        return user


class InternshipPlacementSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    total_score = serializers.ReadOnlyField(source='total_computed_score')

    class Meta:
        model = InternshipPlacement
        fields = '__all__'

    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError({"end_date": "End date must occur after start date."})
        return data


class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = ['supervisor_comment'] if 'request' in globals() and getattr(request.user, 'role', '') == 'STUDENT' else []

    def validate(self, data):
        # Prevent edits if log is already approved
        if self.instance and self.instance.status == 'APPROVED':
            raise serializers.ValidationError("Cannot modify an approved log.")
        return data


class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = '__all__'


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'

    def validate(self, data):
        if data['score'] > data['criteria'].max_score:
            raise serializers.ValidationError({"score": "Score exceeds maximum allowed for this criteria."})
        return data


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # Get the standard token
        token = super().get_token(user)
        
        # Inject custom data
        token['username'] = user.username
        token['role'] = user.role
        
        return token
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']