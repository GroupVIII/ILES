# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, UserSession, SupervisorAssignment, Invitation


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    
    list_display = ('email', 'get_full_name', 'role', 'department', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'department', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'employee_id')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {
            'fields': ('first_name', 'last_name', 'middle_name', 'phone_number', 
                      'gender', 'date_of_birth')
        }),
        (_('Professional Info'), {
            'fields': ('role', 'employee_id', 'department', 'position', 
                      'university', 'major', 'graduation_year')
        }),
        (_('Internship Details'), {
            'fields': ('start_date', 'end_date', 'total_required_hours')
        }),
        (_('Preferences'), {
            'fields': ('email_notifications', 'in_app_notifications', 
                      'theme_preference', 'language', 'timezone')
        }),
        (_('Security'), {
            'fields': ('last_login_ip', 'login_attempts', 'locked_until', 
                      'last_activity', 'notes')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 
                      'user_permissions'),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'last_activity', 'ip_address', 'is_active')
    list_filter = ('is_active', 'login_time')
    search_fields = ('user__email', 'ip_address')
    readonly_fields = ('session_key', 'ip_address', 'user_agent', 'device_info')


@admin.register(SupervisorAssignment)
class SupervisorAssignmentAdmin(admin.ModelAdmin):
    list_display = ('supervisor', 'intern', 'assigned_at', 'is_active')
    list_filter = ('is_active', 'assigned_at')
    search_fields = ('supervisor__email', 'intern__email')


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'invited_by', 'expires_at', 'accepted_at')
    list_filter = ('role', 'accepted_at')
    search_fields = ('email',)