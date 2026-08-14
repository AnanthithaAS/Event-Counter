"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Accounts endpoints directly under /api/ and /api/auth/ for flexibility
    path('api/', include('accounts.urls')),
    path('api/auth/', include('accounts.urls')),
    # Events endpoints under /api/
    path('api/', include('events.urls')),
]
