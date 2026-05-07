# notifications/services.py
from django.utils import timezone
from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import send_mail
from .models import Notification, EmailNotification, NotificationPreference, NotificationTemplate
from accounts.models import User
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service class for sending notifications.
    """
    
    @classmethod
    def send_notification(cls, recipient, category, title, message, 
                         sender=None, notification_type='info', 
                         action_url='', action_text='', data=None,
                         send_email=True):
        """
        Send a notification to a user.
        """
        try:
            # Get or create preferences
            prefs, _ = NotificationPreference.objects.get_or_create(user=recipient)
            
            notification = None
            
            # Create in-app notification if enabled
            if prefs.should_send_in_app(category):
                notification = Notification.objects.create(
                    recipient=recipient,
                    sender=sender,
                    notification_type=notification_type,
                    category=category,
                    title=title,
                    message=message,
                    action_url=action_url,
                    action_text=action_text,
                    data=data or {}
                )
                logger.info(f"Created in-app notification for {recipient.email}: {title}")
            
            # Send email if enabled
            if send_email and prefs.should_send_email(category):
                cls.send_email(
                    recipient=recipient,
                    subject=title,
                    message=message,
                    category=category,
                    notification=notification
                )
            
            return notification
        
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            return None
    
    @classmethod
    def send_email(cls, recipient, subject, message, category, 
                  html_message=None, notification=None):
        """
        Send an email notification.
        """
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # Track email
            EmailNotification.objects.create(
                recipient=recipient,
                email_type=cls._get_email_type(category),
                subject=subject,
                body=message,
                html_body=html_message or '',
                notification=notification
            )
            
            logger.info(f"Email sent to {recipient.email}: {subject}")
            
            # Mark notification as emailed
            if notification:
                notification.email_sent = True
                notification.email_sent_at = timezone.now()
                notification.save(update_fields=['email_sent', 'email_sent_at'])
            
            return True
        
        except Exception as e:
            logger.error(f"Failed to send email to {recipient.email}: {str(e)}")
            
            # Track failed email
            EmailNotification.objects.create(
                recipient=recipient,
                email_type=cls._get_email_type(category),
                subject=subject,
                body=message,
                html_body=html_message or '',
                is_delivered=False,
                error_message=str(e)
            )
            return False
    
    @classmethod
    def send_template_notification(cls, recipient, category, context, 
                                  sender=None, notification_type='info',
                                  action_url='', action_text='', data=None,
                                  send_email=True):
        """
        Send a notification using a template.
        """
        try:
            template = NotificationTemplate.objects.get(category=category, is_active=True)
            
            title = template.render_subject(context)
            message = template.render_message(context)
            html_message = template.render_html(context)
            
            return cls.send_notification(
                recipient=recipient,
                category=category,
                title=title,
                message=message,
                sender=sender,
                notification_type=notification_type,
                action_url=action_url,
                action_text=action_text,
                data=data,
                send_email=send_email
            )
        
        except NotificationTemplate.DoesNotExist:
            logger.warning(f"No template found for category: {category}")
            return None
    
    @classmethod
    def send_bulk_notification(cls, recipients, category, title, message,
                              sender=None, notification_type='info'):
        """
        Send notification to multiple recipients.
        """
        notifications = []
        for recipient in recipients:
            notification = cls.send_notification(
                recipient=recipient,
                category=category,
                title=title,
                message=message,
                sender=sender,
                notification_type=notification_type,
                send_email=True
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @classmethod
    def _get_email_type(cls, category):
        """Map notification category to email type"""
        mapping = {
            Notification.Category.WELCOME: 'welcome',
            Notification.Category.REPORT_REMINDER: 'report_reminder',
            Notification.Category.EVALUATION_REMINDER: 'evaluation_notice',
            # Add more mappings as needed
        }
        return mapping.get(category, 'system_alert')


class NotificationTemplates:
    """
    Predefined notification templates.
    """
    
    @staticmethod
    def log_submitted(intern_name, date, hours):
        return {
            'title': f"Log Submitted: {intern_name}",
            'message': f"{intern_name} has submitted a log for {date} with {hours} hours. Please review.",
            'notification_type': 'info'
        }
    
    @staticmethod
    def log_approved(intern_name, date, hours, reviewer_name):
        return {
            'title': "Log Approved",
            'message': f"Your log for {date} ({hours} hours) has been approved by {reviewer_name}.",
            'notification_type': 'success'
        }
    
    @staticmethod
    def log_rejected(intern_name, date, hours, reviewer_name, comments):
        return {
            'title': "Log Rejected",
            'message': f"Your log for {date} ({hours} hours) was rejected by {reviewer_name}. Comments: {comments}",
            'notification_type': 'error'
        }
    
    @staticmethod
    def report_submitted(intern_name, week):
        return {
            'title': f"Weekly Report Submitted: {intern_name}",
            'message': f"{intern_name} has submitted their weekly report for {week}. Please review.",
            'notification_type': 'info'
        }
    
    @staticmethod
    def report_approved(intern_name, week, reviewer_name):
        return {
            'title': "Report Approved",
            'message': f"Your weekly report for {week} has been approved by {reviewer_name}.",
            'notification_type': 'success'
        }
    
    @staticmethod
    def evaluation_created(intern_name, evaluator_name):
        return {
            'title': "Evaluation Created",
            'message': f"{evaluator_name} has created an evaluation for you. Please review when completed.",
            'notification_type': 'info'
        }
    
    @staticmethod
    def evaluation_completed(intern_name, evaluator_name, score):
        return {
            'title': "Evaluation Completed",
            'message': f"Your evaluation by {evaluator_name} is complete. Overall score: {score}%",
            'notification_type': 'success'
        }
    
    @staticmethod
    def report_reminder(intern_name, week_end_date):
        return {
            'title': "Report Reminder",
            'message': f"This is a reminder to submit your weekly report for week ending {week_end_date}.",
            'notification_type': 'warning'
        }
    
    @staticmethod
    def supervisor_assigned(intern_name, supervisor_name):
        return {
            'title': "Supervisor Assigned",
            'message': f"{supervisor_name} has been assigned as your supervisor.",
            'notification_type': 'success'
        }