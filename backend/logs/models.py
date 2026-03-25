from django.db import models

# Create your models here.
from user.models import User

class Log(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return f"{self.user.username} - {self.action} at {self.timestamp}"
    # @property
    # def username(self):
    #     pass