from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from django.utils import timezone
from core.models import BaseModel
from accounts.models import User
from reports.models import WeeklyReport

# Create your models here.
