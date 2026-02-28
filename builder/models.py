from django.db import models
from django.db.models import JSONField, Index
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.conf import settings

# --- CRITICAL IMPORT ---
# We import the Unit model from our Shared App (core_metadata)
from core_metadata.models import Unit


class WorkspaceMember(models.Model):
    """
    TENANT MODEL: The 'Visa' for a Global User.
    Defines what a user can do inside THIS specific tenant.
    """
    ROLE_CHOICES = [
        ('OWNER', 'Boss (Owner)'),
        ('ADMIN', 'Administrator'),
        ('EDITOR', 'Editor'),
        ('VIEWER', 'Viewer'),
    ]

    # Reference the Global User (from the public schema)
    # Fixed typo: changed on_snapshot to on_delete
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VIEWER')
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user'], name='uniq_member_per_tenant')
        ]

    def __str__(self):
        return f"{self.user.email} as {self.role}"




class Table(models.Model):
    """
    TENANT MODEL: Stored in private schemas (e.g., acme, globex).
    Stores the structural metadata for a user's custom table.
    """
    name = models.CharField(max_length=255)
    ui_x = models.IntegerField(default=350)
    ui_y = models.IntegerField(default=200)
    color = models.CharField(max_length=50, default="bg-blue-500")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class TablePermission(models.Model):
    """
    TENANT MODEL: The Boss uses this to give coworkers 
    access to specific tables.
    """
    member = models.ForeignKey(WorkspaceMember, on_delete=models.CASCADE, related_name='permissions')
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    
    can_view = models.BooleanField(default=True)
    can_edit_data = models.BooleanField(default=False)
    can_edit_structure = models.BooleanField(default=False)
    can_view_formulas = models.BooleanField(default=True)

    class Meta:
        unique_together = ('member', 'table')
        
    

class Column(models.Model):
    """
    TENANT MODEL: Base class for all custom fields.
    """
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('formula', 'Formula'),
        ('link', 'Link'),
    ]
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="columns")
    name = models.CharField(max_length=255)
    column_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='text')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.table.name}.{self.name}"

class TextColumn(Column):
    """Specific settings for string-based attributes."""
    max_length = models.IntegerField(default=255)

class NumberColumn(Column):
    """
    Specific settings for numeric or formula-based attributes.
    Links to the GLOBAL Unit model in the public schema.
    """
    # This Foreign Key correctly points to the public schema 'Unit' model
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True)
    decimals = models.IntegerField(default=2)
    
    is_formula = models.BooleanField(default=False)
    raw_formula = models.TextField(null=True, blank=True)
    
    # Dependency graph for calculations
    dependencies = models.ManyToManyField(
        'Column', 
        through='ColumnDependency', 
        through_fields=('target_column', 'source_column'),
        related_name='dependent_formulas'
    )

class LinkColumn(Column):
    """Specific settings for relational links between private tables."""
    target_table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="incoming_links")
    relation_type = models.CharField(max_length=20, default='one_to_many')

class ColumnDependency(models.Model):
    """Tracks which columns are used in which formulas for efficient recalculation."""
    target_column = models.ForeignKey(NumberColumn, on_delete=models.CASCADE, related_name="target_deps")
    source_column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="source_deps")

    def clean(self):
        # Multi-table inheritance check: ensure target isn't depending on itself via parent pointer
        if self.target_column.column_ptr == self.source_column:
            raise ValidationError("A column cannot depend on itself.")

class Row(models.Model):
    """
    TENANT MODEL: Stores the actual data in JSONB format.
    Formulas are 'materialized' (calculated and saved) here for max read efficiency.
    """
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="rows")
    data = JSONField(default=dict)
    
    class Meta:
        indexes = [Index(fields=['data'], name='row_data_idx')]