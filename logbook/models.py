# logs/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
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
        ADMIN = 'admin', 'Administrative'
        OTHER = 'other', 'Other'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='log_entries'
    )

    # Core fields
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    hours = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators = [MinValueValidator(0.25),MaxValueValidator(24)], 
        help_text="Hours worked (e.g., 4.5 for 4 hours 30 minutes)"
    )

    # Context
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.DEVELOPMENT,
        db_index=True,
    )

    # Tags for better organisation (stored as JSON array)
    tags = models.JSONField(default=list, blank=True)

    # Status workflow
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    # Review tracking
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_logs'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comments =  models.TextField(blank=True)

    #Additional metadata
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

        # Ensure end time is after start time
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
        
        # Ensure date is not in future
        if self.date > timezone.now().date():
            raise ValidationError("Cannot log future dates")
        
        # Ensure hours don't exceed 24
        if self.hours > 24:
            raise ValidationError("Hours cannot exceed 24 in a single day")
        
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def approve(self, reviewer, comments=""):
        """Approve this log entry"""
        self.status = self.Status.APPROVED
        self.reviewed_by = self.reviewer 
        self.reviewed_at = timezone.now()
        self.review_comments = comments
        self.save()

    def reject(self, reviewer, comments=""):
      """Reject this log entry"""
      self.status = self.Status.REJECTED
      self.reviewed_by = self.reviewer
      self.reviewed_at = timezone.now()
      self.review_comments = comments
      self.save()

    def submit(self):
        """Submit for view"""
        self.status = self.Status.SUBMITTED
        self.save()


class LogAttachment(BaseModel):
    """
    Attachments for log entries (screenshots, documents, etc.)
    """
    log_entry = models.ForeignKey(
        LogEntry,
        on_delete=models.CASCADE,
        related_name='attachments'
    )

    file = models.FileField(
        upload_to='log_attachments/%Y/%m/%d'
    )

    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    content_type = models.CharField(max_length=100)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"{self.filename} for {self.log_entry}"
    
    def save(self, *args, **kwargs):
        if self.file and not self.filename:
            self.filename = os.path.basename(self.file.name)
        super().save(*args, **kwargs)


class TimeOff(BaseModel):
    """
    Track intern time off (vacation, sick leave, etc.)
    """
    










               




        
        




        

    
    
    





        
            


