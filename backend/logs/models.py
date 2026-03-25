from django.db import models

# Create your models here.
class Weeklylog(models.Model):
   STATUS_CHOICES = ( 
      ('DRAFT','Draft')
    ('SUBMITTED','Submitted')
    ('REVIEWED''Reviewed')
    ('APPROVED','Approved')
   )