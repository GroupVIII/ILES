# core/utils.py
import re
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def generate_random_password(length=10):
    """
    Generate a secure random password.
    """
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for i in range(length))
    return password

def validate_email(email):
    """
    Validate email format.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_email_notification(subject, message, recipient_list, html_message=None):
    """
    Send email notification with logging.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Email sent to {recipient_list}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
        return False

def get_date_range(days=7):
    """
    Get start and end dates for a date range.
    Default: last 7 days including today.
    """
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def calculate_hours_worked(start_time, end_time):
    """
    Calculate hours worked between two datetime objects.
    """
