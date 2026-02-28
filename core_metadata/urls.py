from django.urls import path
from .views import get_csrf_token, session_login

urlpatterns = [
    path('api/csrf/', get_csrf_token, name='csrf_token'),
    path('api/auth/login/', session_login, name='api_login'),
]