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

        name = models.CharField(max_length = 200, unique = True)
        description = models.TextField()
        
        rubric_type = models.CharField(
            max_length=20,
            choices=RubricType.TypeChoices,
            default=Rubrictype.MIDPOINT,
            db_index=True
        )



        #Rubric structure - JSON defining criteria, weights, and scoring
        structure = models.JSONField(
            default=dict,
            help_text="""
            JSON structure defining evaluation criteria.
            Example:
            {
                "criteria": [
                    {
                        "id": 1,
                        "name": "Technical Skills",
                        "description": "Ability to write clean, efficient code",
                        "weight": 30
                        "max_score": 5
                    },
                    {
                        "id": 2,
                        "name": "Communication",
                        "description": "Clear communication with team",
                         "weight": 20,
                          "max_score": 5
                         "

                    }
                ],
                "scoring guide": {
                    "1": "Needs Improvement",
                    "2": "Developing",
                    "3": "Meets Expectations",
                    "4": "Outstanding"
                }
            }
            """
        )

        #Validity period
        is_active = models.BooleanField(default=true, db_index=true)
        valid_from = models.DateField(default=timezone.now)
        valid_until = models.DateField(null=true, blank=true)

        #Metadata
        created_by = models.ForeignKey(
            User,
            on delete=models.SET_NULL,
            null=true,
            related_name='created rubrics'
        )

        class Meta:
            ordering = ['created_at']
            indexes = [
                models.Index(Fields=['rubric_type', 'is active']),
                models.Index(fields=['valid_from', 'valid_until']),
            ]
            verbose_name = 'Evaluation Rubric'
            verbose_name_plural = 'Evaluation Rubrics'

        def __str__(self):
            return f"{self.name} ({self.get_rubric_type_display()})"
        
        def is_valid (self):
            """check if the rubric is currently valid"""
            today = timezone.now().date
            if self.valid_until:
                return self.is_active and self.valid_from <= today <= self.valid_until
            return self.is_active and self.valid_from <= today
        
        @property
        def total_weight(self):
            """Calculate total weight of all criteria"""
            criteria = self.structure.get('criteria', [])
            return sum(c.get('weight', 0)for c in criteria)
        
        def validate_structure(self):
            """Validate that total weight equals 100"""
            return self.total_weight == 100
        
        class Evaluation(BaseModel):
            """Performance evaluation for the intern"""

            class Status(models.TextChoices):
                DRAFT ='draft', 'Draft'
                PENDING_REVIEW = 'pending_review', 'Pending Review'
                COMPLETED = 'completed', 'Completed'
                ACKNOWLEDGED = 'acknowledged', 'Acknowledged by Intern'
                DISPUTED = 'disputed', 'Disputed'
                
        
        


        
        

                        
                          
                        

            
                        
            }
        )
