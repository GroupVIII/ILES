from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db.models import Sum, F

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student Intern'),
        ('WORKPLACE_SUPERVISOR', 'Workplace Supervisor'),
        ('ACADEMIC_SUPERVISOR', 'Academic Supervisor'),
        ('ADMIN', 'Internship Administrator'),
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class InternshipPlacement(models.Model):
    student = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='placement', limit_choices_to={'role': 'STUDENT'})
    workplace_supervisor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='workplace_interns', limit_choices_to={'role': 'WORKPLACE_SUPERVISOR'})
    academic_supervisor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='academic_interns', limit_choices_to={'role': 'ACADEMIC_SUPERVISOR'})
    company_name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after the start date.")

    @property
    def total_computed_score(self):
        evaluations = self.evaluations.all()
        if not evaluations.exists():
            return 0
        # Computes the weighted score: (score / max_score) * weight
        total = sum((eval.score / eval.max_score) * eval.weight for eval in evaluations)
        return round(total, 2)

    def __str__(self):
        return f"{self.student.username} at {self.company_name}"


class WeeklyLog(models.Model):
    STATE_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Draft (Revision)'),
    ]
    
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE, related_name='weekly_logs')
    week_number = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    activities = models.TextField()
    status = models.CharField(max_length=20, choices=STATE_CHOICES, default='DRAFT')
    supervisor_comment = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('placement', 'week_number')

    def clean(self):
        if self.status in ['APPROVED', 'REJECTED'] and not self.supervisor_comment:
            raise ValidationError("Supervisor comments are required to approve or reject a log.")

    def __str__(self):
        return f"Week {self.week_number} - {self.placement.student.username}"


class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    max_score = models.IntegerField(default=100, blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight percentage (e.g., 40 for 40%)")

    def __str__(self):
        return f"{self.name} ({self.weight}%)"


class Evaluation(models.Model):
    placement = models.ForeignKey(InternshipPlacement, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.PROTECT)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('placement', 'evaluator', 'criteria') 

    def clean(self):
        if self.score > self.criteria.max_score:
            raise ValidationError(f"Score cannot exceed the maximum score of {self.criteria.max_score}")

    @property
    def max_score(self):
        return self.criteria.max_score
    
    @property
    def weight(self):
        return self.criteria.weight
    

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.user.username}: {self.message}"