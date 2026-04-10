from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError

# 1. CustomUser (Our 4 Core Players!)
class CustomUser(AbstractUser):
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
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='student_placements')
    workplace_supervisor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='workplace_supervisions')
    academic_supervisor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='academic_supervisions')
    
    organization = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.student.username}'s placement at {self.organization}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'start_date'], 
                name='unique_placement_date'
            )
        ]

    def clean(self):
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValidationError("The end date must be after the start date.")
    
    def save(self, *args, **kwargs):
        self.full_clean() 
        super().save(*args, **kwargs)

# 3. WeeklyLog (The Quests!)
class WeeklyLog(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
    )
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    activities = models.TextField()
    # Fixed: Only one status definition allowed here
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    supervisor_comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"Week {self.week_number} Log for {self.placement.student.username}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['placement', 'week_number'], 
                name='unique_week_per_placement'
            )
        ]

    def save(self, *args, **kwargs):
        if self.pk:
            original_status = WeeklyLog.objects.get(pk=self.pk).status
            if original_status == 'APPROVED':
                raise PermissionError("This log is approved and cannot be edited.")
        super().save(*args, **kwargs)

# 4. EvaluationCriteria
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=100)
    weight = models.IntegerField(help_text="Percentage weight, e.g., 40 for 40%")

    def __str__(self):
        return f"{self.name} ({self.weight}%)"

# 5. Evaluation
class Evaluation(models.Model):
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE)
    evaluator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.CASCADE)
    score = models.IntegerField(help_text="Score out of 100")

    def __str__(self):
        return f"Evaluation for {self.placement.student.username} by {self.evaluator.username}"

# 6. Issue (Bug Reporting)
class Issue(models.Model):
    ISSUE_TYPES = [
        ('BUG', 'Technical Bug'),
        ('DATA', 'Data Discrepancy'),
        ('ACCESS', 'Permission Issue'),
        ('OTHER', 'Other'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    issue_type = models.CharField(max_length=10, choices=ISSUE_TYPES, default='BUG')
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type}: {self.title}"