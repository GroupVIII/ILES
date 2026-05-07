from django.contrib import admin
from .models import CustomUser, InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation

admin.site.register(CustomUser)
admin.site.register(InternshipPlacement)
admin.site.register(WeeklyLog)
admin.site.register(EvaluationCriteria)
admin.site.register(Evaluation)