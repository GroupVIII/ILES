#logs/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import BaseModel
from core.models import BaseModel
from accounts.models import User
import os

class LogEntry(BaseModel):
    Daily log entry for intern work.
        pass
        
        class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted','Submitted'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected','Rejected'
        NEEDS_REVISION = 'needs_revision','Needs_Revision'
    
class Category(models.TextChoices):
    DEVELOPMENT = 'development','Development'
    DESIGN = 'design','Design'
    RESEARCH = 'research','Research'
    MEETING = 'meeting','Meeting'
    DOCUMENTATION ='documentation','Documentation' 
    TRAINING = 'training','Training'
    ADMIN = 'admin','Administrative'
    OTHER = 'other','Other'

    user = models.ForeignKey( User, on_delete=models.CASCADE,related_name='log_entries')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    hours = models.DecimalField(max_digits=4,decimal_places=2)
    validators=[MinValueValidator(0.25)]
    MaxValueValidator(24)

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices = Category.choices,
        default = Category.DEVELOPMENT,
        db_index = True
    )

    tags = models.JSONField(default=list, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    reviewed_by = models.ForeignKey(
        user,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_logs'
    )
    
    reviewed_at = 
    models.DateTimeField(null=True,blank=True)
    review_comments = 
    models.TextField(blank=True)

    project_code = 
    models.CharField(max_length=50,blank=True)
    is_billable = 
    models.BooleanField(default=True)

    class Meta:
        ordering = ['-date','-created_at']

    indexes = [
        models.Index(fields=['user','-date']),
        models.Index(fields=['status','date']),
        models.Index(fields=['user','status']),
        models.Index(fields=['category','date']),
    ]

    constraints = [
        models.UniqueConstraint(
            fields=['user','date'],
            name='unique_user_date_log'
        )
    ]

   verbose_name = 'Log Entry'
   verbose_name_plural = 'Log Entries'

def __str__(self):
    return f"{self.user.get_full_name()} - {self.date} - {self.hours}h"

def clean(self):
    from django.core.exceptions import ValidationError
    if self.start_time and self.end_time and self.start_time >=self.end_time:
        raise ValidationError("End time must be after start time")
    if self.date >timezone.now().date():
        raise ValidationError("Cannot log future dates")
    if self.hours >24:
        raise ValidationError("Hours cannot exceed 24 in a single day")
    def save(self,*args,**kwargs):
        self.clean()
        super().save(*args,**kwargs)
        def approve(self,reviewer,comments=""):
            self.status = self.Status.APPROVED
            self.reviewed_by = reviewer
            self.reviewed_at = timezone.now()
            self.review_comments = comments
            self.save()
            def reject(self,reviewer,comments=""):
                self.status = self.Status.REJECTED
                self.reviewed_by = reviewer
                self.reviewed_at = timezone.now()
                self.review_comments = comments
                self.save()
                def submit(self):
                    """Submit for review"""
                    self.status = self.Status.SUBMITTED
                    self.save()
                    class LogAttachment(BaseModel):
                        """Attachments for log entries (screenshots,documents,etc)"""
                        log_entry = models.ForeignKey(
                            LogEntry,
                            on_delete=models.CASCADE,
                            related_name='attachments'
                        )
                        



                        

                        



                


    
    
    
    



 






        

        