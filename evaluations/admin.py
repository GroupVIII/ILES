from django.contrib import admin



from .models import (
    EvaluationRubric, Evaluation, EvaluationGoal, 
    EvaluationSkill, EvaluationReminder
)

class EvaluationGoalInline(admin.TabularInline):
    model = EvaluationGoal
    extra = 1
    fields = ('goal_description', 'priority', 'status', 'due_date')

