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

    # Time period
    week_start_date = models.DateField(db_index=True)
    week_end_date = models.DateField(db_index=True)
    
    # Content sections (stored as JSON for flexibility)
    accomplishments = models.JSONField(
        default=list,
        help_text="List of accomplishments for the week"
    )
    challenges = models.JSONField(
        default=list,
        help_text="List of challenges faced"
    )
    learnings = models.JSONField(
        default=list,
        help_text="Key learnings from the week"
    )

    # Goals
    next_week_goals = models.JSONField(
        default=list,
        help_text="Goals for next week"
    )
    long_term_goals = models.TextField(
        blank=True,
        help_text="Long-term goals and career aspirations"
    )
    
    # Feedback from intern
    feedback_for_supervisor = models.TextField(
        blank=True,
        help_text="Feedback or questions for supervisor"
    )
    
    # Metrics (auto-calculated from logs)
    total_hours = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    tasks_completed = models.IntegerField(default=0)

    # Status workflow
    status = models.CharField(
        max_length=20, 
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    
    # Review fields
    reviewer_comments = models.TextField(blank=True)
    reviewer_rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1-5"
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Submission tracking
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-week_start_date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-week_start_date']),
            models.Index(fields=['status', 'week_start_date']),
            models.Index(fields=['user', 'status']),
        ]
        unique_together = [['user', 'week_start_date']]
        verbose_name = 'Weekly Report'
        verbose_name_plural = 'Weekly Reports'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Week of {self.week_start_date}"
    
    