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



