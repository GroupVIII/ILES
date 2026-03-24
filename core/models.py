from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError

# 1. CustomUser (Our 4 Core Players!)
class CustomUser(AbstractUser):
    # We use 'choices' to make a dropdown menu for the roles [4]
    ROLE_CHOICES = (
        ('STUDENT', 'Student Intern'),
        ('WORKPLACE_SUP', 'Workplace Supervisor'),
        ('ACADEMIC_SUP', 'Academic Supervisor'),
        ('ADMIN', 'Internship Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

# 2. InternshipPlacement (Where the student goes)
class InternshipPlacement(models.Model):
    # ForeignKeys link the placement to our CustomUser table [5]
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='student_placements')
    workplace_supervisor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='workplace_supervisions')
    academic_supervisor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='academic_supervisions')
    
    organization = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.student.username}'s placement at {self.organization}"
    # Add this inside your InternshipPlacement class in models.py
    class Meta:
        constraints = [
            # Prevents a student from having two different placements 
            # starting on the same exact day. [cite: 98, 125]
            models.UniqueConstraint(
                fields=['student', 'start_date'], 
                name='unique_placement_date'
            )
        ]
    def clean(self):
        # Check if dates exist before comparing them
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValidationError("The end date must be after the start date.")
    
    def save(self, *args, **kwargs):
        self.full_clean() # This ensures clean() is called even in the admin panel
        super().save(*args, **kwargs)

# 3. WeeklyLog (The Quests!)
class WeeklyLog(models.Model):
    # These are the exact 4 states Dr. Wakholi asked for in Week 2! [6]
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
    )
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    activities = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    supervisor_comments = models.TextField(blank=True, null=True) # Blank allows it to be empty initially [7]

    def __str__(self):
        return f"Week {self.week_number} Log for {self.placement.student.username}"
    class Meta:
        constraints = [
            # Prevents a student from submitting two logs for the same week 
            # within a single placement. 
            models.UniqueConstraint(
                fields=['placement', 'week_number'], 
                name='unique_week_per_placement'
            )
        ]
    def save(self, *args, **kwargs):
        # Check if the log already exists in the database
        if self.pk:
            # Fetch the version currently stored in the database
            original_status = WeeklyLog.objects.get(pk=self.pk).status
            
            # If the stored version is already 'APPROVED', block the save
            if original_status == 'APPROVED':
                raise PermissionError("This log is approved and cannot be edited.")
        super().save(*args, **kwargs)
        
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
# 4. EvaluationCriteria (The Grading Rubric)
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=100) # e.g., "Workplace Evaluation"
    weight = models.IntegerField(help_text="Percentage weight, e.g., 40 for 40%") # [8]

    def __str__(self):
        return f"{self.name} ({self.weight}%)"

# 5. Evaluation (The Final Scores)
class Evaluation(models.Model):
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE)
    evaluator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)
    score = models.IntegerField(help_text="Score out of 100")

    def __str__(self):
        return f"Evaluation for {self.placement.student.username} by {self.evaluator.username}"

class Issue(models.Model):
    ISSUE_TYPES = [
        ('BUG', 'Technical Bug'),
        ('DATA', 'Data Discrepancy'),
        ('ACCESS', 'Permission Issue'),
        ('OTHER', 'Other'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_backend=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    issue_type = models.CharField(max_length=10, choices=ISSUE_TYPES, default='BUG')
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type}: {self.title}"