from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.row),
    # This prefix is CRITICAL for your Login.jsx 'http://127.0.0.1:8000/api/token/' call
    path('api/', include('core.urls')), 
]