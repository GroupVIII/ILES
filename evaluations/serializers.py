#evaluations/serializers.py
from rest_framework import serializers
from .models import EvaluationRubric,Evaluation, EvaluationGoal, EvaluationSkill, EvaluationReminder
from accounts.serializers import UserSerializer

class EvaluationRubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRubric
        fields = '__all__'

class EvaluationSerializer(serializer.ModelSerializer):
    intern_details = UserSerializer(source='intern', read_only=True)
    evaluator_details = UserSerializer(source='evaluator', read_only=True)
    class Meta:
        model = Evaluation
        fields = '__all__'