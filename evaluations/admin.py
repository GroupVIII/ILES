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
         ('Rubric Structure', {
            'fields': ('structure',),
            'description': 'Define criteria, weights, and scoring in JSON format'
        }),
        ('Validity', {
            'fields': ('is_active', 'valid_from', 'valid_until')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('intern', 'evaluator', 'evaluation_date', 'rubric', 'overall_score', 'status')
    list_filter = ('status', 'evaluation_date', 'rubric__rubric_type')
    search_fields = ('intern__email', 'intern__first_name', 'intern__last_name', 'evaluator__email')
    inlines = [EvaluationGoalInline]
    
        
