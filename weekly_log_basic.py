# 4. Evaluation criteria
class EvaluationCriteria (models.model):
  name = models.charField(max_length=100)
  weight = models.IntegerField(help_text="percentage weight, e.g 40 for 40%)

  def __str__(self):
    return f"{self.name} ({self.weight}%)
  

                               

                               






















