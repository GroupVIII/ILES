from dataclasses import fields
from user.models import CustomUser
from django.db import models

class CustomUserSerializers(models.Model):
    model = CustomUser
    fields = []