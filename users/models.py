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
   

   


class User(AbstractUser, BaseModel):
    """
    Custom User model with role-based authentication.
    Extends Django's AbstractUser for built-in auth features.
    """
    
    class Roles(models.TextChoices):
        INTERN = 'intern', 'Intern'
        SUPERVISOR = 'supervisor', 'Supervisor'
        ADMIN = 'admin', 'Administrator'
        HR = 'hr', 'Human Resources'
    
    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'
        PREFER_NOT_TO_SAY = 'prefer_not_to_say', 'Prefer Not to Say'
    
    # Override username to make email the primary identifier
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
    
    # Personal Information
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True)
    
    phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."
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
    
    # Professional Information
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.INTERN,
        db_index=True,
        help_text="User role determines permissions and access"
    )
    
    employee_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text="Company employee/student ID"
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        help_text="Department or team"
    )
    
    position = models.CharField(
        max_length=100,
        blank=True,
        help_text="Job title or position"
    )
    
    # Internship Specific Fields
    university = models.CharField(max_length=200, blank=True)
    major = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    
    start_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Internship start date"
    )
    
    end_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Internship end date"
    )
    
    total_required_hours = models.IntegerField(
        default=40,
        help_text="Total hours required for internship"
    )
    
    # Profile
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        help_text="Profile picture"
    )
    
    bio = models.TextField(max_length=500, blank=True)
    
    # Security Fields
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Preferences
    email_notifications = models.BooleanField(
        default=True,
        help_text="Receive email notifications"
    )
    
    in_app_notifications = models.BooleanField(
        default=True,
        help_text="Receive in-app notifications"
    )
    
    theme_preference = models.CharField(
        max_length=10,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    
    language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('es', 'Spanish'), ('fr', 'French')],
        default='en'
    )
    
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's timezone"
    )
    
    # Metadata
    last_activity = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Internal notes about user")
    
    # Email as the unique identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomUserManager()
    
    class Meta:
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['is_active', 'role']),
            models.Index(fields=['department', 'role']),
            models.Index(fields=['start_date', 'end_date']),
        ]
        permissions = [
            ('can_evaluate_interns', 'Can evaluate interns'),
            ('can_view_all_reports', 'Can view all reports'),
            ('can_manage_users', 'Can manage users'),
            ('can_assign_supervisors', 'Can assign supervisors to interns'),
            ('can_export_data', 'Can export system data'),
        ]
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the full name with middle name if exists"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Return the short name"""
        return self.first_name
    
    @property
    def is_intern(self):
        """Check if user is an intern"""
        return self.role == self.Roles.INTERN
    
    @property
    def is_supervisor(self):
        """Check if user is a supervisor"""
        return self.role == self.Roles.SUPERVISOR
    
    @property
    def is_admin_or_hr(self):
        """Check if user is admin or HR"""
        return self.role in [self.Roles.ADMIN, self.Roles.HR]
    
    @property
    def is_hr(self):
        """Check if user is HR"""
        return self.role == self.Roles.HR
    
    @property
    def is_admin_user(self):
        """Check if user is admin"""
        return self.role == self.Roles.ADMIN
    
    @property
    def internship_status(self):
        """Get internship status based on dates"""
        today = timezone.now().date()
        
        if not self.start_date:
            return 'not_started'
        
        if today < self.start_date:
            return 'scheduled'
        elif self.end_date and today > self.end_date:
            return 'completed'
        else:
            return 'active'
    
    @property
    def days_remaining(self):
        """Calculate days remaining in internship"""
        if self.end_date:
            today = timezone.now().date()
            remaining = (self.end_date - today).days
            return max(0, remaining)
        return None
    
    def record_login(self, ip_address):
        """Record successful login"""
        self.last_login_ip = ip_address
        self.login_attempts = 0
        self.locked_until = None
        self.last_login = timezone.now()
        self.last_activity = timezone.now()
        self.save(update_fields=[
            'last_login_ip', 'login_attempts', 
            'locked_until', 'last_login', 'last_activity'
        ])
        logger.info(f"User {self.email} logged in from IP: {ip_address}")
    
    def record_failed_login(self):
        """Record failed login attempt"""
        self.login_attempts += 1
        
        # Lock account after 5 failed attempts
        if self.login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=30)
            logger.warning(f"User {self.email} locked until {self.locked_until} due to failed login attempts")
        
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def is_account_locked(self):
        """Check if account is locked"""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])
    
    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send email to this user"""
        send_mail(
            subject,
            message,
            from_email or settings.DEFAULT_FROM_EMAIL,
            [self.email],
            **kwargs
        )
    
    def can_access_module(self, module_name):
        """Check if user can access specific module based on role"""
        # Admin can access everything
        if self.is_admin_or_hr:
            return True
        
        # Define module access by role
        access_matrix = {
            'logs': [self.Roles.INTERN, self.Roles.SUPERVISOR],
            'reports': [self.Roles.INTERN, self.Roles.SUPERVISOR],
            'evaluations': [self.Roles.SUPERVISOR],
            'users': [self.Roles.SUPERVISOR],
            'dashboard': [self.Roles.INTERN, self.Roles.SUPERVISOR],
        }
        
        return self.role in access_matrix.get(module_name, [])

class UserProfile(BaseModel):
    """
    Extended user profile for additional information.
    One-to-one relationship with User.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Skills & Interests
    skills = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    
    # Social Links
    linkedin_url = models.URLField(max_length=500, blank=True)
    github_url = models.URLField(max_length=500, blank=True)
    portfolio_url = models.URLField(max_length=500, blank=True)
    
    # Documents
    resume = models.FileField(
        upload_to='resumes/',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile for {self.user.email}"