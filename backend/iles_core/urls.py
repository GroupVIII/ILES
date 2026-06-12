from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.serializers import CustomTokenObtainPairSerializer
from rest_framework.routers import DefaultRouter
from api import views
from django.http import JsonResponse

router = DefaultRouter()
router.register(r'placements', views.InternshipPlacementViewSet)
router.register(r'logs', views.WeeklyLogViewSet)
router.register(r'evaluations', views.EvaluationViewSet)
router.register(r'evaluation-criteria', views.EvaluationCriteriaViewSet)
router.register(r'users', views.UserViewSet, basename='user')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
def api_root(request):
    return JsonResponse({"message": "ILES Backend API is live and running."})

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Token Endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Notification Endpoints
    path('api/notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/mark-read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
]

# This serves Django's static files (like Admin panel CSS)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# NOTE: The React TemplateView catch-all route has been deleted.
# Your Django backend is now a 100% pure API!