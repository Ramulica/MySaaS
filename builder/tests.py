from builder.models import Unit
from decimal import Decimal

def populate_all_units():
    # Define groups for organized population
    units_to_create = [
        # Length
        {'id': 'mm', 'name': 'Millimeter', 'label': 'mm', 'symbol': 'mm', 'category': 'length', 'conversion_rate': Decimal('0.001')},
        {'id': 'cm', 'name': 'Centimeter', 'label': 'cm', 'symbol': 'cm', 'category': 'length', 'conversion_rate': Decimal('0.01')},
        {'id': 'm', 'name': 'Meter', 'label': 'm', 'symbol': 'm', 'category': 'length', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'km', 'name': 'Kilometer', 'label': 'km', 'symbol': 'km', 'category': 'length', 'conversion_rate': Decimal('1000.0')},

        # Area (Squared)
        {'id': 'mm2', 'name': 'Square Millimeter', 'label': 'mm²', 'symbol': 'mm²', 'category': 'area', 'conversion_rate': Decimal('0.000001')},
        {'id': 'cm2', 'name': 'Square Centimeter', 'label': 'cm²', 'symbol': 'cm²', 'category': 'area', 'conversion_rate': Decimal('0.0001')},
        {'id': 'm2', 'name': 'Square Meter', 'label': 'm²', 'symbol': 'm²', 'category': 'area', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'km2', 'name': 'Square Kilometer', 'label': 'km²', 'symbol': 'km²', 'category': 'area', 'conversion_rate': Decimal('1000000.0')},

        # Volume (Cubed)
        {'id': 'mm3', 'name': 'Cubic Millimeter', 'label': 'mm³', 'symbol': 'mm³', 'category': 'volume', 'conversion_rate': Decimal('0.000000001')},
        {'id': 'cm3', 'name': 'Cubic Centimeter', 'label': 'cm³', 'symbol': 'cm³', 'category': 'volume', 'conversion_rate': Decimal('0.000001')},
        {'id': 'm3', 'name': 'Cubic Meter', 'label': 'm³', 'symbol': 'm³', 'category': 'volume', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'km3', 'name': 'Cubic Kilometer', 'label': 'km³', 'symbol': 'km³', 'category': 'volume', 'conversion_rate': Decimal('1000000000.0')},

        # Mass
        {'id': 'mg', 'name': 'Milligram', 'label': 'mg', 'symbol': 'mg', 'category': 'mass', 'conversion_rate': Decimal('0.000001')},
        {'id': 'g', 'name': 'Gram', 'label': 'g', 'symbol': 'g', 'category': 'mass', 'conversion_rate': Decimal('0.001')},
        {'id': 'kg', 'name': 'Kilogram', 'label': 'kg', 'symbol': 'kg', 'category': 'mass', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},

        # Time
        {'id': 'days', 'name': 'Days', 'label': 'Days', 'symbol': 'd', 'category': 'time', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'months', 'name': 'Months', 'label': 'Months', 'symbol': 'mo', 'category': 'time', 'conversion_rate': Decimal('30.4375')},
        {'id': 'years', 'name': 'Years', 'label': 'Years', 'symbol': 'yr', 'category': 'time', 'conversion_rate': Decimal('365.25')},

        # Specialized
        {'id': 'percent', 'name': 'Percentage', 'label': 'Percent %', 'symbol': '%', 'category': 'percentage', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'unit', 'name': 'Unit', 'label': 'Unit (pcs)', 'symbol': 'pcs', 'category': 'quantity', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
        {'id': 'none', 'name': 'None', 'label': 'None', 'symbol': '-', 'category': 'none', 'conversion_rate': Decimal('1.0'), 'is_base_unit': True},
    ]

    for u_data in units_to_create:
        Unit.objects.update_or_create(
            id=u_data['id'],
            defaults={
                'name': u_data['name'],
                'label': u_data['label'],
                'symbol': u_data['symbol'],
                'category': u_data['category'],
                'conversion_rate': u_data['conversion_rate'],
                'is_base_unit': u_data.get('is_base_unit', False)
            }
        )
    
    # Sync Currencies using the BNR logic
    Unit.sync_bnr_rates(main_currency_id='eur')
    print("Database populated with physical units and latest BNR currency rates.")

