from django.db import models
class InternshipPlacement(models.Model):
  student = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "student_placements")
  workplace_supervisor = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "workplace_supervisions")
  academic_supervisor = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "academic_supervisions")
  organisation = models.CharField(max_length = 200)
  start_date = models.DateField()
  end_date = models.DateField()























