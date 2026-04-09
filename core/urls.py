from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Identity & Access (Crucial for Login)
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Features
    path('issues/', views.IssueListCreateView.as_view(), name='issue-list'),
    path('logs/', views.WeeklyLogListCreateView.as_view(), name='log-list'),
    path('all-logs/', views.SupervisorLogListView.as_view(), name='all-logs'),
    path('logs/<int:pk>/approve/', views.ApproveLogView.as_view(), name='approve-log'),
]