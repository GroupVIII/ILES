from django.contrib import admin



from .models import (
    EvaluationRubric, Evaluation, EvaluationGoal, 
    EvaluationSkill, EvaluationReminder
)

class EvaluationGoalInline(admin.TabularInline):
    model = EvaluationGoal
    extra = 1
    fields = ('goal_description', 'priority', 'status', 'due_date')

@admin.register(EvaluationRubric)
class EvaluationRubricAdmin(admin.ModelAdmin):
    list_display = ('name', 'rubric_type', 'is_active', 'valid_from', 'valid_until', 'created_at')
    list_filter = ('rubric_type', 'is_active')
    search_fields = ('name', 'description')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'rubric_type')
        }),