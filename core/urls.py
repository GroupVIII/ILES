from django.urls import path
from .views import IssueListCreateView

urlpatterns = [
    path('api/issues/', IssueListCreateView.as_view(), name='issue-list'),
]