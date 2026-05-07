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

    def __str__(self):
        return f"{self.recipient.email} - {self.title[:50]}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def mark_as_unread(self):
        """Mark notification as unread"""
        self.is_read = False
        self.read_at = None
        self.save(update_fields=['is_read', 'read_at']) 

    @classmethod
    def mark_all_as_read(cls, user):
        """Mark all notifications for a user as read"""
        cls.objects.filter(recipient=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        class EmailNotification(BaseModel):
    """
    Track email notifications sent to users.
    """
    
    class EmailType(models.TextChoices):
        WELCOME = 'welcome', 'Welcome Email'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        REPORT_REMINDER = 'report_reminder', 'Report Reminder'
        EVALUATION_NOTICE = 'evaluation_notice', 'Evaluation Notice'
        WEEKLY_DIGEST = 'weekly_digest', 'Weekly Digest'
        SYSTEM_ALERT = 'system_alert', 'System Alert'
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='emails'
    )
    email_type = models.CharField(
        max_length=20,
        choices=EmailType.choices,
        db_index=True
        )
    
    subject = models.CharField(max_length=255)
    body = models.TextField()
    html_body = models.TextField(blank=True)
    
    # Status
    sent_at = models.DateTimeField(default=timezone.now)
    is_delivered = models.BooleanField(default=True)

     # Error tracking
    error_message = models.TextField(blank=True)
    
    # Related notification (if any)
    notification = models.ForeignKey(
        Notification,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emails'
    )
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient', '-sent_at']),
            models.Index(fields=['email_type', '-sent_at']),
        ]
    
    def __str__(self):
        return f"{self.recipient.email} - {self.subject[:50]}"
    
class NotificationPreference(BaseModel):
    """
    User preferences for notifications.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Email preferences
    email_logs = models.BooleanField(default=True)
    email_reports = models.BooleanField(default=True)
    email_evaluations = models.BooleanField(default=True)
    email_reminders = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    
    # In-app preferences
    in_app_logs = models.BooleanField(default=True)
    in_app_reports = models.BooleanField(default=True)
    in_app_evaluations = models.BooleanField(default=True)
    in_app_reminders = models.BooleanField(default=True)
    in_app_system = models.BooleanField(default=True)

     # Digest settings
    digest_frequency = models.CharField(
        max_length=10,
        choices=[
            ('instant', 'Instant'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('never', 'Never')
        ],
        default='instant'
    )
    
    last_digest_sent = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
    
    def should_send_email(self, category):
        """Check if email should be sent for this category"""
        category_map = {
            Notification.Category.LOG_SUBMITTED: self.email_logs,
            Notification.Category.LOG_APPROVED: self.email_logs,
            Notification.Category.LOG_REJECTED: self.email_logs,
            Notification.Category.REPORT_SUBMITTED: self.email_reports,
            Notification.Category.REPORT_APPROVED: self.email_reports,
            Notification.Category.EVALUATION_CREATED: self.email_evaluations,
            Notification.Category.EVALUATION_COMPLETED: self.email_evaluations,
            Notification.Category.REPORT_REMINDER: self.email_reminders,
            Notification.Category.EVALUATION_REMINDER: self.email_reminders,
            Notification.Category.SYSTEM_ALERT: self.email_system,
        }
        return category_map.get(category, True)
    
    def should_send_in_app(self, category):
        """Check if in-app notification should be created"""
        category_map = {
            Notification.Category.LOG_SUBMITTED: self.in_app_logs,
            Notification.Category.LOG_APPROVED: self.in_app_logs,
            Notification.Category.LOG_REJECTED: self.in_app_logs,
            Notification.Category.REPORT_SUBMITTED: self.in_app_reports,
            Notification.Category.REPORT_APPROVED: self.in_app_reports,
            Notification.Category.EVALUATION_CREATED: self.in_app_evaluations,
            Notification.Category.EVALUATION_COMPLETED: self.in_app_evaluations,
            Notification.Category.REPORT_REMINDER: self.in_app_reminders,
            Notification.Category.EVALUATION_REMINDER: self.in_app_reminders,
            Notification.Category.SYSTEM_ALERT: self.in_app_system,
        }
        return category_map.get(category, True)
    
    class NotificationTemplate(BaseModel):
    """
    Templates for notifications and emails.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Template content
    subject_template = models.CharField(max_length=255)
    message_template = models.TextField()
    html_template = models.TextField(blank=True)
    
    # Which category this template is for
    category = models.CharField(
        max_length=30,
        choices=Notification.Category.choices,
        unique=True
        )
    
    # Variables expected (for documentation)
    expected_variables = models.JSONField(default=list, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def render_subject(self, context):
        """Render subject with context"""
        return self.subject_template.format(**context)
    
    def render_message(self, context):
        """Render message with context"""
        return self.message_template.format(**context)
    
    def render_html(self, context):
        """Render HTML template with context"""
        if self.html_template:
            return self.html_template.format(**context)
        return None


class PushSubscription(BaseModel):
    """
    Web push notification subscriptions for browser notifications.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='push_subscriptions'
    )
    

    
    
    


    
           
    
    
    


        
