from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from django.utils import timezone
from core.models import BaseModel
from accounts.models import User
from reports.models import WeeklyReport

# Create your models here.
class EvaluationRubric(BaseModel):
    """
    Defines evaluation criteria and scoring rubrics for intern assessments
    """

    class RubricType(models.TextChoices):
        MIDPOINT = 'Midpoint', 'Midpoint Evaluation'
        FINAL = 'Final', 'Final Evaluation'
        MONTHLY = 'Monthly', 'Monthly Review'
        PROJECT = 'project', 'Project-Based Review'
        SKILL = 'skill', 'Skill Assessment'
        