# reviews/admin.py
from django.contrib import admin
from .models import WeeklyReport, ReportComment, ReportTemplate, ReportReminder


class ReportCommentInline(admin.TabularInline):
    model = ReportComment
    extra = 0
    readonly_fields = ('created_at',)

