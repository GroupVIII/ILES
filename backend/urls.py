from django.contrib import admin
from django.urls import path, include # You MUST import 'include'
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import MyTokenObtainPairView # Import your custom view

urlpatterns = [
    path('admin/', admin.site.urls),
    # Point the login to your custom view for the Role check
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # This line connects the two files! 
    # It tells Django: "Anything starting with api/ belongs to the core.urls"
    path('api/', include('core.urls')), 
]