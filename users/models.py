# models.py
from django.contrib.auth.models import AbstructUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator, MinLengthValidator,EmailValidator
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from models import BaseModel, TimeStampedModel
import uuid
import logging

logger = logging.getLogger(__name__)

#BaseUserManager
class CustomUserManager(BaseUserManager):
   """Manager for custom user model where the email is the unique identifier"""

   use_in_migration = True 

#creating users
   def _create_user(self, email, password, **extra_fields):
      if not email:
         raise ValueError('The Email field must be set')
      
      email = self.normalize_email(email)
      user = self.model(email=email, **extra_fields)
      user.set_password(password)
      user.save(using=self._db)
      return user
   
   def create_user(self, email, password=None, **extra_fields):
      extra_fields.setdefault('is_staff', False)
      extra_fields.setdefault('is_superuser', False)
      return self._create_user(email, password, **extra_fields)
   
   def create_superuser(self, email, password, **extra_fields):
      extra_fields.setdefault('is_staff', True)
      extra_fields.setdefault('is_superuser',True)


      if extra_fields.get('is_staff') is not True:
         raise ValueError('Superuser must have is_staff=True.')
      if extra_fields.get('is_superuser') is not True:
         raise ValueError('Superuser must have is_superuser=True.')
      
      return self._create_user(email, password, **extra_fields)