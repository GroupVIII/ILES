# notifications/models.py
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from core.models import BaseModel
from accounts.models import User
import json
import uuid

class Notification(BaseModel):
    """
    In-app notifications for users.
    """
    class NotificationType(models.TextChoices):
        INFO = 'info', 'Information'
        SUCCESS = 'success', 'Success'
        WARNING = 'warning', 'Warning'
        ERROR = 'error', 'Error'

    class Category(models.TextChoices):
        # Logs related
        LOG_SUBMITTED = 'log_submitted', 'Log Submitted'
        LOG_APPROVED = 'log_approved', 'Log Approved'
        LOG_REJECTED = 'log_rejected', 'Log Rejected'
        LOG_COMMENT = 'log_comment', 'Log Comment'

        # Reports related
        REPORT_SUBMITTED = 'report_submitted', 'Report Submitted'
        REPORT_APPROVED = 'report_approved', 'Report Approved'
        REPORT_REJECTED = 'report_rejected', 'Report Rejected'
        REPORT_COMMENT = 'report_comment', 'Report Comment'
        REPORT_REMINDER = 'report_reminder', 'Report Reminder'

        # Evaluations related
        EVALUATION_CREATED = 'evaluation_created', 'Evaluation Created'
        EVALUATION_COMPLETED = 'evaluation_completed', 'Evaluation Completed'
        EVALUATION_ACKNOWLEDGED = 'evaluation_acknowledged', 'Evaluation Acknowledged'
        EVALUATION_DISPUTED = 'evaluation_disputed', 'Evaluation Disputed'
        EVALUATION_REMINDER = 'evaluation_reminder', 'Evaluation Reminder'

         #System related
        ACCOUNT_CREATED = 'account_created', 'Account Created'
        PASSWORD_CHANGED = 'password_changed', 'Password Changed'
        SUPERVISOR_ASSIGNED = 'supervisor_assigned', 'Supervisor Assigned'
        SYSTEM_ALERT = 'system_alert', 'System Alert'

        recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
        sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications'
         )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.INFO
         )
    
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
       
        db_index=True
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    # Action link (where to go when clicked)
    action_url = models.CharField(max_length=500, blank=True)
    action_text = models.CharField(max_length=100, blank=True)

    # Additional data (JSON for storing related object IDs, etc.)
    data = models.JSONField(default=dict, blank=True)

     # Read status
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    # Email status
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read', '-created_at']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['email_sent', 'created_at']),
        ]
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
    
    


        
