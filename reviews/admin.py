# reviews/admin.py
from django.contrib import admin
from .models import WeeklyReport, ReportComment, ReportTemplate, ReportReminder


class ReportCommentInline(admin.TabularInline):
    model = ReportComment
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(WeeklyReport)
class WeeklyReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'week_start_date', 'week_end_date', 'total_hours', 'status', 'submitted_at')
    list_filter = ('status', 'week_start_date', 'user__role')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at', 'submitted_at', 'reviewed_at')
    inlines = [ReportCommentInline]
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Week Period', {
            'fields': ('week_start_date', 'week_end_date')
        }),
        ('Content', {
            'fields': ('accomplishments', 'challenges', 'learnings', 'next_week_goals', 'long_term_goals')
        }),
        ('Feedback', {
            'fields': ('feedback_for_supervisor',)
        }),
        ('Metrics', {
            'fields': ('total_hours', 'tasks_completed')
        }),
        ('Status & Review', {
            'fields': ('status', 'reviewed_by', 'reviewed_at', 'reviewer_comments', 'reviewer_rating')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'created_at', 'updated_at')
        }),
    )
