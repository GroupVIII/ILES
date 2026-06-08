from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings # Add this
from django.conf.urls.static import static # Add this
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.serializers import CustomTokenObtainPairSerializer
from rest_framework.routers import DefaultRouter
from api import views
from api.views import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'placements', views.InternshipPlacementViewSet)
router.register(r'logs', views.WeeklyLogViewSet)
router.register(r'evaluations', views.EvaluationViewSet)
router.register(r'evaluation-criteria', views.EvaluationCriteriaViewSet)
router.register(r'users', views.UserViewSet, basename='user')


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/mark-read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
    
    path('', include('api.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]