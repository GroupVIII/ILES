from django.db import models

class Evaluation(models.Model):
  placement = models.ForeignKey(InternshipPlacement, on_delete = models.CASCADE)
  evaluator = models.Foreignkey(CustomUser, on_delete = models.CASCADE)
  criteria = models.ForeignKey(EvaluationCriteria, on_delete= models.CASCADE)
  score = models.IntegerField(help_text = "Out of 100%")
  date = models.DateField(null = True)
  class Meta:
    pass 

  def __str__(self):

    return f"Evaluation for {self.placement.student.username} by {self.evaluator.username}"
  


    
  























