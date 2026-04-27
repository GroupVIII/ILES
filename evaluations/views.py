from django.shortcuts import render 
#create your views here.
#evaluations/views.py

from rest__framework import viewsets, permissions, status
from rest__framework.decorators import action
from rest__framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import EvaluationRubric, Evaluation, EvaluationGoal, EvaluationSkill, EvaluationReminder
from .serializers import (
    EvaluationRubicSerializer, EvaluationSerializer,
    EvaluationGoalSerializer, EvaluationStillSerializer,
    EvaluationReminderSerializer
)
import logging
 logger = logging.getLogger(__name__)

class EvaluationRubricViewSet(viewsets.ModelViewSet):
    """ViewSet for managing evaluation rubrics."""
    queryset = EvaluationRubric.objects.all()
    serializer_class = EvaluationRubicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
       # Filter rubrics based on user role
       if self.request.user.is_admin_or_hr:
          return EvaluationRubric.objects.all()
       return EvaluationRubric.objects.filter(is_active=True)
    
class EvaluationViewSet(viewsets.ModelViewSet):
   """ViewSet for managing evaluations."""
   queryset = Evaluation.objects.all()
   serializer_class = EvaluationSerializer
   permission_classes = [permissions.isAuthenticated]

   def get_queryset(self):
      user = self.request.user
      if user.is_admin_or_hr:
         return Evaluation.objects.all()
      elif user.is_supervisor:
         #supervisors see evaluations they created
         return Evaluation.objects.filter(evaluator=user)

       



