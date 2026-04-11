from django.urls import path, include
# import include
from user.views import CustomUserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', CustomUserViewSet)

urlpatterns = [path('', include(router.urls))]