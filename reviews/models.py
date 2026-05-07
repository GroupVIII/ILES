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
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        NEEDS_REVISION = 'needs_revision', 'Needs Revision'
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='weekly_reports'
    )