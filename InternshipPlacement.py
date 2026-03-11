from django.db import models
from django.core.exceptions import ValidationError
class InternshipPlacement(models.Model):
  student = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "student_placements")
  workplace_supervisor = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "workplace_supervisions")
  academic_supervisor = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "academic_supervisions")
  organization = models.CharField(max_length = 200)
  start_date = models.DateField()
  end_date = models.DateField()

  def __str__(self):
    return f"{self.student.username}'s placement at {self.organization}

  class Meta:
    constraints = [
      models.UniqueConstraint(
        fields = ["student", "start_date"],
        name = "unique_placement_per_date"
      )
    ]
  
  def clean(self):
    if self.start_date and self.end_date:
      if self.start_date >= self.end_date:
        raise ValidationError("The end date must be after the start date.")

  def save(self, *args, **kwargs)
    self.full_clean()
    super().save(*args, **kwargs)
  
  























