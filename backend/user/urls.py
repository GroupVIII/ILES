
from user.views import CustomUserViewSet
from django.urls import path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', CustomUserViewSet)

urlpatterns = router.urls