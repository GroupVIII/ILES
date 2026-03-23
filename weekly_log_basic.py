from django.db import models
from django.contrib.auth.models import User

class CustomUser(models.Model):
  username = models.CharField(max_length=150)
  email = models.EmailField(unique=True)
  first_name = models.CharField(max_length=30)
  last_name = models.CharField(max_length=30)

  def __str__(self):
    return self.username

class InternshipPlacement(models.Model):
  student = models.ForeignKey(CustomUser, on_delete = models.CASCADE)
  company_name = models.CharField(max_length=255)
  start_date = models.DateField()
  end_date = models.DateField()

  def __str__(self):
    return f"{self.student.username} at {self.company_name}"

class EvaluationCriteria(models.Model):
  name = models.CharField(max_length=255)
  description = models.TextField()

  def __str__(self):
    return self.name

# class IntrenshipLog(models.Model):
class Evaluation(models.Model):
  placement = models.ForeignKey(InternshipPlacement, on_delete = models.CASCADE)
  evaluator = models.Foreignkey(CustomUser, on_delete = models.CASCADE)
  criteria = models.ForeignKey(EvaluationCriteria, on_delete= models.CASCADE)
  score = models.IntegerField(help_text = "Out of 100%")
  date = models.DateField(null = True)
  # class Meta:
  #   model = Evaluation 
  #   #fields = 

  def __str__(self):

    return f"Evaluation for {self.placement.student.username} by {self.evaluator.username}"
  

class Issue(models.Model):

  issue_type =  models.CharField(max_length = 200)
  description = models.TextField()
  resolve = models.BooleanField(default = False)
  def __str__(self):
    return self.issue_type






















