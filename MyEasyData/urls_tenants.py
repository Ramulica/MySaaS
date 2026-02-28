"""
URL configuration for MyEasyData project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from core_metadata.views import get_csrf_token, session_login

urlpatterns = [
    # Roots for subdomains like acme.localhost:8000
    path('api/builder/', include('builder.urls')),
    path('api/csrf/', get_csrf_token),
    path('api/auth/login/', session_login),
]
