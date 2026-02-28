from django.urls import path
from .views import SchemaView, UnitListView

urlpatterns = [
    path('schema/', SchemaView.as_view(), name='schema_handle'),
    # path('users/', UserListView.as_view(), name='user_list'),
    # New endpoint for global units
    path('units/', UnitListView.as_view(), name='unit_list'),
]