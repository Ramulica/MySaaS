from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django.conf import settings

class Client(TenantMixin):
    name = models.CharField(max_length=100)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)

    auto_create_schema = True

    # IMPORTANT: use class attributes, not @property
    shared_apps = settings.SHARED_APPS
    tenant_apps = settings.TENANT_APPS

class Domain(DomainMixin):
    pass