from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import json
from .models import Table, Column, TextColumn, NumberColumn, LinkColumn, WorkspaceMember
from core_metadata.models import Unit

class UnitListView(APIView):
    def get(self, request):
        # Fetches global units. 
        # Note: If core_metadata is in TENANT_APPS, these are local to the tenant.
        units = Unit.objects.all().values('id', 'name', 'label', 'symbol', 'category')
        return Response(list(units))

class SchemaView(APIView):
    def get(self, request):
        # Ensure the user has a member profile in this workspace
        try:
            member = WorkspaceMember.objects.get(user=request.user)
        except (WorkspaceMember.DoesNotExist, TypeError):
            return Response({"error": "No workspace access"}, status=status.HTTP_403_FORBIDDEN)

        tables = Table.objects.all()
        data = []
        for table in tables:
            cols = []
            for col in table.columns.all():
                info = {
                    "id": col.id, 
                    "name": col.name, 
                    "type": col.column_type, 
                    "isPk": col.name == 'id',
                    "order": col.order
                }
                if hasattr(col, 'numbercolumn'):
                    num = col.numbercolumn
                    info.update({
                        "unit": num.unit_id, 
                        "formula": num.raw_formula
                    })
                elif hasattr(col, 'linkcolumn'):
                    link = col.linkcolumn
                    info.update({
                        "relation": str(link.target_table_id),
                        "relationType": link.relation_type
                    })
                cols.append(info)
            
            data.append({
                "id": table.id, "name": table.name, "x": table.ui_x, "y": table.ui_y,
                "color": table.color, "columns": cols
            })
        
        return Response({
            "tables": data,
            "user_role": member.role # Tell frontend if they are BOSS or COWORKER
        })

    @transaction.atomic
    def post(self, request):
        # --- BOSS ONLY SECURITY ---
        try:
            member = WorkspaceMember.objects.get(user=request.user)
            if member.role != 'OWNER' and member.role != 'ADMIN':
                return Response({"error": "Only the Boss or Admins can modify architecture"}, status=status.HTTP_403_FORBIDDEN)
        except (WorkspaceMember.DoesNotExist, TypeError):
            return Response({"error": "Authentication Required"}, status=status.HTTP_401_UNAUTHORIZED)

        # --- DEBUG PRINT FOR TERMINAL ---
        print("\n" + "⭐" * 20)
        print(f"SENDER: {request.user.email} (Role: {member.role})")
        print("DEBUG: DATA RECEIVED FROM FRONTEND:")
        print(json.dumps(request.data, indent=2))
        print("⭐" * 20 + "\n")
        
        tables_data = request.data.get('tables', [])
        
        # Clear existing to perform clean sync
        Table.objects.all().delete()
        table_map = {}
        
        # 1. Create Table Objects
        for t in tables_data:
            table_obj = Table.objects.create(
                name=t['name'], 
                ui_x=t.get('x', 350), 
                ui_y=t.get('y', 200), 
                color=t.get('color', 'bg-blue-600')
            )
            table_map[str(t['id'])] = table_obj

        # 2. Create Columns with Logic
        for t_data in tables_data:
            parent_table = table_map[str(t_data['id'])]
            for idx, c in enumerate(t_data.get('columns', [])):
                if c.get('isPk') and c['name'] == 'id':
                    continue
                
                c_type = c.get('type', 'text')
                
                if c_type == 'text':
                    TextColumn.objects.create(table=parent_table, name=c['name'], column_type='text', order=idx)
                
                elif c_type in ['number', 'formula']:
                    unit_id = c.get('unit')
                    unit_obj = Unit.objects.filter(id=unit_id).first() if unit_id else None
                    NumberColumn.objects.create(
                        table=parent_table, name=c['name'], column_type=c_type, order=idx,
                        unit=unit_obj, is_formula=(c_type == 'formula'), raw_formula=c.get('formula')
                    )
                
                elif c_type == 'link':
                    target_ui_id = str(c.get('relation'))
                    target_table_obj = table_map.get(target_ui_id)
                    rel_pattern = c.get('relationType', 'one_to_many')
                    
                    if target_table_obj:
                        LinkColumn.objects.create(
                            table=parent_table, name=c['name'], column_type='link', 
                            order=idx, target_table=target_table_obj, relation_type=rel_pattern
                        )
        
        return Response({"status": "success"}, status=status.HTTP_201_CREATED)