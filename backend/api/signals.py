# api/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import WeeklyLog, Notification

@receiver(post_save, sender=WeeklyLog)
def notify_on_log_status_change(sender, instance, created, **kwargs):
    # If the log was just created, it's a DRAFT, so we don't notify anyone yet.
    if created:
        return

    # Scenario 1: Workplace Supervisor Approves the Log
    if instance.status == 'APPROVED':
        message = f"Good news! Your log for Week {instance.week_number} has been APPROVED."
        
        # 1. Create the In-App Notification
        Notification.objects.create(user=instance.placement.student, message=message)
        
        # 2. Send the Email
        send_mail(
            subject='ILES Logbook Approved',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.placement.student.email],
            fail_silently=True,
        )