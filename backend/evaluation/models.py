from datetime import timezone
from django.db import models
import uuid

# import timezone

# Create your models here.
class Evaluation(models.Model):
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