from django.conf import settings
from django.db import connection

class CustomTenantSyncRouter:
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # 1. Identify which apps belong where
        tenant_app_labels = [app.split('.')[-1] for app in settings.TENANT_APPS]
        
        # 2. Get the current schema being migrated
        # django-tenants sets this on the connection during migrate_schemas
        schema = getattr(connection, "schema_name", "public")

        # CASE: Migrating the PUBLIC schema
        if schema == "public":
            if app_label in tenant_app_labels:
                return False  # BLOCK builder from public
            return True

        # CASE: Migrating a TENANT schema
        else:
            if app_label == 'core_metadata':
                return False # BLOCK shared metadata from tenants
            
            # For everything else, let the TenantSyncRouter handle it
            return None