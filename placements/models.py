# placements/models.py
from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from django.utils import timezone
from core.models import BaseModel
from accounts.models import User

class Department(BaseModel):
    """Departments within the organization."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)

    # Manager/Head of Department
    head = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departmets',
        limit_choices_to={'role__in' :[User.Roles.SUPERVISOR,User.Roles.ADMIN]}'
    )

    # Department metaData
    location = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    is_active = models.BooleanField(default=True)   

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]

        def __str__(self):
            return f"{self.name} ({self.code})"
        
    class Placement(BaseModel):
        """Tracks intern placements within deapartments."""

        class Status(models.TextChoices):
            PENDING = 'pending', 'Pending'
            ACTIVE = 'active', 'Active'
            COMPLETED = 'completed', 'Completed'
            EXTENDED = 'extended', 'Extended'
            TERMINATED = 'terminated', 'Terminated'

        intern = models.foreignKey(
            User,
            on_delete=models.CASCADE,
            related_name='placements',
            on_delete=models.PROTECT,
            related_name='placements'
        )

        #placement details
        title = models.CharField(max_length=200, help_text="Intern title/role")
        description = models.TextField(blank=True)

        #Supervisor (can be multiple)
        supervisors = models.ManyToManyField(
            User,
            related_name='supervised_placements',
            limit_choices_to={'role':User.Roles.SUPERVISOR,}
            blank=True
        )

        #placement period
        start_date = models.DateField()
        end_date = models.DateField()
        expected_end_date = models.DateField(blank=True, null=True)

        #status
        status = models.CharField(
            max_length=20,
            choices=Status.choices,
            default=Status.PENDING
            db_index=True
        )
        #placement details
        stipend = models.DecimalField(
            max_digits=10,
            decimal_places=2,
            null=True,
            blank=True,
            help_text="Monthly stipend amount"
        )

        working_hours_per_week = models.IntegerField(
            default=40,
            validators=[MinValueValidator(1), MaxValueValidator(168)],
        )

        #Documents
        offer_letter = models.FileField(
            upload_to='placements/offer_letters/',
            null=True,
            blank=True
        )

        #notes
        notes = models.TextField(blank=True)

        #MetaData
        created_by = models.ForeignKey(
            User,
            on_delete=models.SET_NULL,
            null=True,
            related_name='created_placements'
        )

        class Meta:
            ordering = ['-start_date', '-created_at']
            indexes = [
                models.Index(fields=['intern', 'status']),
                models.Index(fields=['departments', 'status']),
                models.Index(fields=['start_date', 'end_date']),
            ]
            unique_together = [('intern', 'start_date')]

        def __str__(self):
            return f"{self.intern.get_full_name()} - {self.department.name} ({self.start_date})"
        
        @property
        def duration_days(self):
            """Calculate the duration of the placement in days."""
            if self.end_date and self.start_date:
                return (self.end_date - self.start_date).days
            return None
         
        @property
        def is_active(self):
            """Check if the placement is currently active."""
            today = timezone.now().date()
            return self.status == self.Status.ACTIVE and self.start_date <= self.end_date
        
        @property
        def days_remaining(self):
            """Calculates days remaining in placement"""
            if self.is_active and self.end_date:
                today = timezone.now().date()
                remaining = (self.end_date - today).days
                return max(0, remaining)
            return None
        
        def complete(self):
            """Mark the placement as completed."""
            self.status = self.Status.COMPLETED
            self.save()

        def extend(self, new_end_date):
            """Extend the placement end_date"""
            self.status = self.Status.EXTENDED
            self.expected_end_date = self.end_date
            self.end_date = new_end_date
            self.save()

        class PlacementHistory(BaseModel):
            """Tracks changes in placements(history/audit log)"""
            placement = models.ForeignKey(
                Placement,
                on_delete=models.CASCADE,
                related_name='history'
            )

            changed_by = models.ForeignKey(
                User,
                on_delete=models.SET_NULL,
                null=True,
            )

                
                
                
        
        
        


            
 



