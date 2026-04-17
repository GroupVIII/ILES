from datetime import timezone
from django.db import models

import uuid
from django.utils import timezone
from user.models import CustomUser
# import timezone

# Create your models here.

class EvaluationRubric(models.Model):
    pass


class Evaluation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='evaluations')
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


    class Issue(models.Model):
        ISSUE_LIST = [
            ('bug', 'Bug'),
            ('feature', 'Feature Request'),
            ('improvement', 'Improvement')
        ]
        issue_type = models.CharField(max_length=30, choices=ISSUE_LIST, default='bug')
        description = models.TextField(blank=True)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        # updated_at = models.DateTimeField(auto_now=True)
        resolve = models.BooleanField(default=False)

    class Status(models.Model):
        PENDING = 'pending', 'Pending'
        UNDER_REVIEW = 'under_review', 'Under_Review'
        REVIEWED = 'reviewed', 'Reviewed'
        APPROVED = 'approved', 'Approved'
    
    status = models.CharField(max_length=20 ,choices = Status.choices)
    