from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # This is the single source of truth for all ILES API endpoints
    path('api/', include('core.urls')), 
]