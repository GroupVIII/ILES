# models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
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
   
class Gender(models.TextChoices):
      MALE = 'male', 'Male'
      FEMALE = 'female','Female'
      OTHER = 'other', 'Other'
      PREFER_NOT_TO_SAY = 'prefer_not_to_say','Prefer_Not_To_Say'    
   
#AbstractUser
class User(AbstractUser, BaseModel):
   """
   Custgom User model with role-based authentication.
   extends Django's AbstractUser for built-in auth features.
   """
   class Roles(models.TextChoices):
      INTERN = 'intern','Intern'
      SUPERVISOR = 'supervisor', 'Supervisor'
      ADMIN = 'admin', 'Admin'
      HR = 'hr', 'Human Resource'

  

#Override username to make email the primary identifier
username = None
email = models.EmailField(
   unique=True,
   db_index=True,
   validators=[EmailValidator(message="Enter a valid email address.")],
   error_messages={
      'unique': 'A user with this email already exists.',
      'invalid': 'Enter a valid email address.'
   }
)

#Personal information
first_name = models.CharField(max_length=150)
last_name = models.CharField(max_length=150)
middle_name = models.CharField(max_length=150)

phone_number = models.CharField(
   max_length=15,
   validators=[
      RegexValidator(
         regex=r'^\?1?\d{9,15}$',
         messages="Phone number must bes entered informat:'+999999999'.Up to 15 digits allowed"

      )
   ],
   blank=True,
   help_text="Contact phone number"
)

gender = models.CharField(
   max_length=20,
   choices=Gender.choices,
   default=Gender.PREFER_NOT_TO_SAY,
   blank=True
) 

date_of_birth = models.DateField(null=True, blank=True)
