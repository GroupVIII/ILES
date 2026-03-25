from django.urls import path
from .views import IssueListCreateView
from . import views

urlpatterns = [
    path('api/issues/', IssueListCreateView.as_view(), name='issue-list'),
    path('api/all-logs/', views.SupervisorLogListView.as_view(), name='all-logs'),
    path('api/logs/<int:pk>/approve/', views.ApproveLogView.as_view(), name='approve-log'),
]