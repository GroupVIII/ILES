from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from gjango.utils import timezone
from django.conf import settings
from core.models import BaseModel
from accounts.models import User
import os 

class LogEntry(BaseModel):
    """
     Daily log entry for intern work.
     """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        APPROVED = 'approve', 'Approved'
        REJECTED = 'rejected','Rejected'
        NEEDS_REVISION = 'needs_revision','Needs_Revision'

    class Category(models.TextChoices):
        DEVELOPMENT = 'development', 'Development'
        DESIGN = 'design', 'Design'
        RESEARCH = 'research', 'Research'
        MEETING = 'meeting', 'Meeting'
        DOCUMENTATION = 'documentation', 'Documentation'
        TRAINING = 'training', 'Training'
        ADMIN = 'admin', 'Admin'
        OTHER = 'other', 'Other'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='log_entries'
    )
    
    date = models.DateField()
    db_index = True
    


        
            


