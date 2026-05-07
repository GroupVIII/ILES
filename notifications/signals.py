# notifications/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from logs.models import LogEntry
from reports.models import WeeklyReport
from evaluations.models import Evaluation
from accounts.models import SupervisorAssignment
from .services import NotificationService, NotificationTemplates


@receiver(post_save, sender=LogEntry)
def notify_log_submitted(sender, instance, created, **kwargs):
    """Notify supervisor when intern submits a log"""
    if instance.status == LogEntry.Status.SUBMITTED and created:
        # Get intern's supervisor
        assignment = instance.user.supervisor_assignments.filter(is_active=True).first()
        if assignment and assignment.supervisor:
            template = NotificationTemplates.log_submitted(
                instance.user.get_full_name(),
                instance.date,
                instance.hours
            )
            
            NotificationService.send_notification(
                recipient=assignment.supervisor,
                category='log_submitted',
                title=template['title'],
                message=template['message'],
                notification_type=template['notification_type'],
                data={'log_id': str(instance.id)},
                action_url=f"/logs/{instance.id}",
                action_text="Review Log"
            )


@receiver(post_save, sender=WeeklyReport)
def notify_report_submitted(sender, instance, created, **kwargs):
    """Notify supervisor when intern submits a report"""
    if instance.status == WeeklyReport.Status.SUBMITTED and created:
        # Get intern's supervisor
        assignment = instance.user.supervisor_assignments.filter(is_active=True).first()
        if assignment and assignment.supervisor:
            template = NotificationTemplates.report_submitted(
                instance.user.get_full_name(),
                instance.week_display
            )
            
            NotificationService.send_notification(
                recipient=assignment.supervisor,
                category='report_submitted',
                title=template['title'],
                message=template['message'],
                notification_type=template['notification_type'],
                data={'report_id': str(instance.id)},
                action_url=f"/reports/{instance.id}",
                action_text="Review Report"
            )


@receiver(post_save, sender=Evaluation)
def notify_evaluation_created(sender, instance, created, **kwargs):
    """Notify intern when evaluation is created"""
    if created and instance.status == Evaluation.Status.DRAFT:
        template = NotificationTemplates.evaluation_created(
            instance.intern.get_full_name(),
            instance.evaluator.get_full_name()
        )
        
        NotificationService.send_notification(
            recipient=instance.intern,
            category='evaluation_created',
            title=template['title'],
            message=template['message'],
            notification_type=template['notification_type'],
            data={'evaluation_id': str(instance.id)},
            action_url=f"/evaluations/{instance.id}",
            action_text="View Evaluation"
        )


@receiver(post_save, sender=SupervisorAssignment)
def notify_supervisor_assigned(sender, instance, created, **kwargs):
    """Notify intern when supervisor is assigned"""
    if created and instance.is_active:
        template = NotificationTemplates.supervisor_assigned(
            instance.intern.get_full_name(),
            instance.supervisor.get_full_name()
        )
        
        NotificationService.send_notification(
            recipient=instance.intern,
            category='supervisor_assigned',
            title=template['title'],
            message=template['message'],
            notification_type='success',
            data={'assignment_id': str(instance.id)},
            action_url=f"/profile",
            action_text="View Profile"
        )