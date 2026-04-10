from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Changed from 'row' to 'urls'
    path('admin/', admin.site.urls), 
    path('api/', include('core.urls')),
]