from django.utils import choices
from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.contrib.auth import validators
from django.db import models

# Create your models here.
from user.models import CustomUser

class LogEnt(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='log_entries')
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        NEEDS_REVISION = 'needs_revision', 'Needs_revision'

    class Category(models.TextChoices):
        DEVELOPMENT = 'development', 'Development'
        RESEARCH = 'research', 'Research'
        ADMIN = 'admin', 'Admin'
        OTHER = 'other', 'Other'

    #Time
    date = models.DateField(db_index = True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text = "Hours worked",
        validators = [
            MinValueValidator(0.25),
            MaxValueValidator(24)
        ]
    )
    #Log Details
    status = models.CharField(
        max_length = 30,
        choices = Status.choices,
        default = Status.DRAFT,
        db_index = True
    )

    #Category
    category = models.CharField(
        max_length = 30,
        choices = Category.choices,
        help_text ="Category",
        db_index = True,
        default = Category.DEVELOPMENT
    )
    tags = models.JSONField(default = list, blank = True)

    class Meta:
        ordering = ['-date', '-timestamp']
        