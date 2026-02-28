from django.urls import path
from .views import SchemaView, UnitListView

urlpatterns = [
    path('schema/', SchemaView.as_view(), name='schema_api'),
    path('units/', UnitListView.as_view(), name='units_api'),
]