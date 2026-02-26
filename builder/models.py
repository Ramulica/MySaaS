from django.db import models
from django.db.models import JSONField, Index

class Table(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Column(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    data_type = models.CharField(max_length=50) # 'text', 'number', 'formula'

class Row(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    data = JSONField(default=dict)
    
    class Meta:
        indexes = [
            Index(fields=['data'], name='row_data_gin_idx'), # The secret to speed
        ]