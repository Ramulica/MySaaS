from django.contrib import admin
from django.urls import path, include
from core_metadata.views import get_csrf_token, session_login, register_workspace

urlpatterns = [
    path('admin/', admin.site.urls),
    # Roots for the main localhost:8000
    path('api/csrf/', get_csrf_token),
    path('api/auth/login/', session_login),
    path('api/auth/register/', register_workspace),
]