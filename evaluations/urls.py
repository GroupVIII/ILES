 evaluations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rubrics', views.EvaluationRubricViewSet, basename='rubric')
router.register(r'evaluations', views.EvaluationViewSet, basename='evaluation')
router.register(r'goals', views.EvaluationGoalViewSet, basename='goal')
router.register(r'skills', views.EvaluationSkillViewSet, basename='skill')
router.register(r'reminders', views.EvaluationReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
]