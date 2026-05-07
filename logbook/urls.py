# logs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'entries', views.LogEntryViewSet, basename='logentry')
router.register(r'timeoff', views.TimeOffViewSet, basename='timeoff')

urlpatterns = [
    path('', include(router.urls))
]








