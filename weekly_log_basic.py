from django.db import models
from django.core.exceptions import PermissionDenied 
class InternshipPlacement (models.Model):pass 
class InternshipPlacement(models.Model):
  def save(self,*args,**kwargs):
    self.full_clean()
    super().save(*args,**kwargs)





















