from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.core.validators import EmailValidator
# Create your models here.
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        INTERN = 'intern', 'Intern'
        SUPERVISOR = 'supervisor', 'Supervisor'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'
        PREFER_NOT_TO_SAY = 'prefer_not_to_say', 'Prefer not to say'
    # username = None  # Remove the username field from the default AbstractUser  

    first_name = models.CharField(max_length=30, blank=False)
    last_name = models.CharField(max_length=30, blank=False)
    department = models.CharField(max_length=50, blank=True)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.INTERN)
    gender = models.CharField(max_length=20, choices=Gender.choices, default=Gender.PREFER_NOT_TO_SAY)      
    
    email = models.EmailField(
        unique=True, 
        blank=False, 
        validators=[EmailValidator(message="Enter a valid email address.")],
        error_messages={
            'unique': "A user with that email already exists.",
            'blank': "Email field cannot be blank."
        }
        )
    
    # USERNAME_FIELD = 'email'  # Use email as the unique identifier for authentication
    # REQUIRED_FIELDS = ['first_name', 'last_name']  # Fields required when creating a superuser  

    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    # Additional fields for interns
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'