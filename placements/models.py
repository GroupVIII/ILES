# placements/models.py
from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from django.utils import timezone
from core.models import BaseModel
from accounts.models import User

class Department(BaseModel):
    """Departments within the organization."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)

    # Manager/Head of Department
    head = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departmets',
        limit_choices_to={'role__in' :[User.Roles.SUPERVISOR,User.Roles.ADMIN]}'
    )

    # Department metaData
    location = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    is_active = models.BooleanField(default=True)   

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]

# Create your models here.
