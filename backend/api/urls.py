from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InternshipPlacementViewSet, WeeklyLogViewSet, EvaluationViewSet, EvaluationCriteriaViewSet, NotificationListView

router = DefaultRouter()
router.register(r'placements', InternshipPlacementViewSet, basename='placement')
router.register(r'logs', WeeklyLogViewSet, basename='log')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'evaluation-criteria', EvaluationCriteriaViewSet)
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/notifications/', NotificationListView.as_view(), name='unread-notifications'),
]