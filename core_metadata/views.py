from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.contrib.auth import authenticate, login
import json

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Sets the CSRF cookie. Frontend must call this before any POST request (Login/Register).
    """
    return JsonResponse({"status": "CSRF cookie set"})

@csrf_protect
def session_login(request):
    """
    Handles secure session-based login for the Boss/Coworkers.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        
        # Authenticate using custom User model (email as username)
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({"status": "success", "user": user.email})
        else:
            return JsonResponse({"detail": "Invalid credentials"}, status=401)
            
    except Exception as e:
        return JsonResponse({"detail": str(e)}, status=400)