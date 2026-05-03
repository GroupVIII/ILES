from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from gjango.utils import timezone
from django.conf import settings
from core.models import BaseModel
from accounts.models import User
import os 

class LogEntry(BaseModel):
    """
     Daily log entry for intern work.
     """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        APPROVED = 'approve', 'Approved'
        REJECTED = 'rejected','Rejected'
        NEEDS_REVISION = 'needs_revision','Needs_Revision'

    class Category(models.TextChoices):
        DEVELOPMENT = 'development', 'Development'
        DESIGN = 'design', 'Design'
        RESEARCH = 'research', 'Research'
        MEETING = 'meeting', 'Meeting'
        DOCUMENTATION = 'documentation', 'Documentation'
        TRAINING = 'training', 'Training'
        ADMIN = 'admin', 'Admin'
        OTHER = 'other', 'Other'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='log_entries'
    )
    
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    hours = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators = [MinValueValidator(0.25),MaxValueValidator(24)], 
        help_text="Hours worked (e.g., 4.5 for 4 hours 30 minutes)"
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.DEVELOPMENT,
        db_index=True,
    )
    
    tags = models.JSONField(default=list, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_logs'
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comments =  models.TextField(blank=True)

    project_code = models.CharField(max_length=50, blank=True)
    is_billable = models.BooleanField(default=True)


    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user','-date']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['category', 'date'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'date'],
                name='unique_user_date_log'
            )
        ]
        verbose_name = 'Log Entry'
        verbose_name_plural = 'Log Entries'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date} - {self.hours}h"
    def clean(self):
        """validate log entry"""
        from django.core.exceptions import ValidationError

        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
        
        if self.date > timezone.now().date():
            raise ValidationError("Cannot log future dates")
        
        if self.hours > 24:
            


        

    
    
    





        
            


