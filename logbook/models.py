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
    
 
