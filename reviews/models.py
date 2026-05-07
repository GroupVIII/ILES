# reports/models.py
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel
from accounts.models import User
from logs.models import LogEntry


class WeeklyReport(BaseModel):
    """
    Weekly summary report created by interns.
    """
    