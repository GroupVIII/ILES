from django.urls import path
from . import views

urlpatterns = [
    path('issues/', views.IssueListCreateView.as_view(), name='issue-list'),
    path('logs/', views.WeeklyLogListCreateView.as_view(), name='log-list'),
    path('all-logs/', views.SupervisorLogListView.as_view(), name='all-logs'),
    path('logs/<int:pk>/approve/', views.ApproveLogView.as_view(), name='approve-log'),
]