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

            intern = models.ForeignKey(
                User,
                on_delete=models.CASCADE,
                related_name='evaluation_received',
                limit_choices_to={'role': User.Roles.INTERN}

            )

            evaluator = models.ForeignKey(
                User,
                on_delete=models.CASCADE,
                related_name='evaluations_given',
                limit_choices_to={'role__in': [User.Roles.SUPERVISOR,User.Roles.SUPERVISOR, User.Roles.ADMIN, User.Roles.HR]}

                
            )

            rubric = models.ForeignKey(
                Evaluation Rubric,
                on_delete=models.PROTECT,
                related_name='evaluations'
            )

            #Evaluation period
            evaluation_date = models.DateField(default=timezone.now)
            period_start = models.DateField()
            period_end = models.DateField()

        #Scores stored as JSON
        scores = models.JSONField(
            default=dict,
            help_text="JSON containing scores for each criterion"
        )

        # Overall score (calculated)
        overall_score = models.DecimalField(
            max_digits=5,
            decimal_places=2,
            null=True,
            blank=True,
            validators=[MinValueValidator(0),MaxValueValidator(100)]

        )

        #Comments and feedback
        strengths = models.TextField(help_text="Key strenths observed")
        areas_for_improvement = models.TextField(help_text="Areas needing improvement")
        overall_comments = models.TextField(blank=True)

        #Intern's response 
        intern_comments = models.TextField(
            blank=True,
            help_text="Intern's feedback on the evaluation"
        )
        intern_acknowledged_at = models.DateTimeField(null=True, blank=True)

        #Status
        status = models.CharField(
            max_length=20,
            choices=Status.Choices,
            default=Status.DRAFT,
            db_index=True
        )

        #Related reports (optional)
        related_reports = models.ManyToManyField(
            WeeklyReport,
            blank=True,
            related_name='evaluations'
        )

        #Next steps
        recommended_next_steps = models.TextField(blank=True)

        class Meta:
            ordering = ['-evaluation_date', '-created_at']
            indexes = [
                models.IndexFields=['intern', 'status'],
                models.Index(fields=['evaluator','evaluation_date']),
                models.Index(fields=['status', 'evaluation_date']),
            
            ]
            verbose_name = 'Evaluation'
            verbose_name_plural = 'Evaluations'
        def __str__(self):  
             return f"Evaluation of {self.intern.get_full_name()} by {self.evaluator.get_full_name()} on {self.evaluation_date}"
        
        def save(self, *args, **kwargs):
            #calculate overall score if scores exist
            if self.scores and self.rubric:
                self.calculate_overall_score()
            super().save(*args, **kwargs)

        def calculate_overall_score(self):
            """calculate weighted overall score based on rubric and scores"""
            if not self.rubric or not self.scores:
                return
            
            criteria = self.rubric.structure.get('criteria', [])
            total_score = 0
            total_weight = 0

            for criterion in criteria:
                criterion_id = str(criterion.get('id'))
                weight = criterion.get('weight', 0)
                max_score = criterion.get('max_score', 5)

                if criterion_id in self.scores:
                    score = self.scores[criterion_id]
                    #normalize score to percentage
                    normalized_score = (score / max_score) * 100 
                    total_weighted_score += normalized_score * (weight / 100)
                    total_weight += weight

            if total_weight > 0:
                self.overall_score = round(total_weighted_score, 2)

        def complete(self):
            """Mark evaluation as completed and set status"""
            self.status = self.Status.COMPLETED
            self.save()

        def acknowledge(self, intern_commented=""):
            """Intern acknowledges the evaluation"""
            self.status = self.Status.ACKNOWLEDGED
            self.intern_comments = intern_commented
            self.intern_acknowledged_at = timezone.now()
            self.save()

        @property
        def score_percentage(self):
            """Return overall score as percentage"""
            if self.overall_score:
                return f"{self.overall_score}%"
            return "N/A"
        
            score = float(self.overall_score)
            if score >= 90:
                return "A"
            elif score >= 80:
                return "B"
            elif score >= 70:
                return "C"
            elif score >= 60:
                return "D"  
            else:
                return "F"
            
    class EvaluatioGoal(BaseModel):
            """Goals set during evaluation for intern to work on"""
            evaluation = models.ForeignKey(
                Evaluation,
                on_delete=models.CASCADE,
                related_name='goals'
            )

            goal_description = models.TextField()

            class Priority(models.TextChoices):
                HIGH = 'high', 'High'
                MEDIUM = 'medium', 'Medium'
                LOW = 'low', 'Low'

            priority = models.CharField(
                max_length=10,
                choices=Priority.choices,
                default=Priority.MEDIUM,

            )
            
            class Status(models.TextChoices):
                PENDING = 'pending', 'Pending'
                IN_PROGRESS = 'in_progress', 'In Progress'
                COMPLETED = 'completed', 'Completed'
                CANCELLED = 'cancelled', 'Cancelled'

            status = models.CharField(
                max_length=15,
                choices=Status.choices,
                default=Status.PENDING,
                db_index=True

            )

            due_date = models.DateField(null=True, blank=True)
            completed_at = models.DateTimeField(null=True, blank=True)

            #progress tracking
            progress_notes = models.TextField(blank=True)
            
            class Meta:
                ordering = ['-priority', 'due_date']
                
            def __str__(self):
                return f"Goal for {self.evaluation.intern.get_full_name()}: {self.goal_description[:50]}"
            
            def complete(self, notes=""):
                """Mark goal as completed"""
                self.status = self.Status.COMPLETED
                self.completed_at = timezone.now()
                if notes:
                    self.progress_notes = notes
                self.save()

            
        class EvaluationSkill(BaseModel):
            """track skill progression over time"""
            intern = models.ForeignKey(
                User,
                on_delete=models.CASCADE,
                related_name='skills_progress'
            )

            skill_name = models.CharField(max_length=100)
            skill_category = models.CharField(max_length=50, blank=True)

            #Current proficiency
            current_level = models.IntegerField(
                validators=[MinValueValidator(1),MaxValueValidator(5)]
                help_text="Current skill level (1-5)"
            )  
            #Target level
            target_level = models.IntegerField(
                validators=[MinValueValidator(1), MaxValueValidator(5)]
                null=True,
                blank=True

            ) 

            #Assessment
            last_assessed_at = models.DateTimeField(null=True,blank=True) 
            last_assessed_by = models.ForeignKey(
                User,
                on_delete=models.SET_NULL,
                null=True
                related_name='assessed_skills'
            ) 

            notes = models.TextField(blank=True)

            class Meta:
                unique_together = [['intern', 'skill_name']] 
                indexes = [ 
                    models.Index(fields=['intern', 'skill_category']),
                ]
                ordering = ['skill_category', 'skill_name']

            def __str__(self):
                return f"{self.intern.get.full_name()}"- {self.skill_name}: Level {self.current_level}"
            
            class EvaluationReminder(BaseModel):
                """Reminders for upcoming or overdue evaluations"""

            class RemindersType(models.TextChoices):
                UPCOMING = 'upcoming', 'Upcoming Evaluation'
                OVERDUE = 'overdue', 'Overdue Evaluation'
                FOLLOW_UP = 'follow_up', 'Follow_up Required'
                
                




                
        
        


        
        

                        
                          
                        

            
                        
            }
        )
