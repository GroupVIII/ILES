from django.contrib import admin
from .models import Evaluation, Issue, EvaluationRubric
# Register your models here.

admin.site.register(Evaluation)
admin.site.register(Issue)
admin.site.register(EvaluationRubric)