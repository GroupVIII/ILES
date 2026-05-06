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
