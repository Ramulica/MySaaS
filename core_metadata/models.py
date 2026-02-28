import requests
import xml.etree.ElementTree as ET
from django.db import models
from decimal import Decimal
from django.contrib.auth.models import AbstractUser


class Plan(models.Model):
    """
    GLOBAL: Defined by you (the platform creator).
    Determines the limits for the 'Boss'.
    """
    name = models.CharField(max_length=50, unique=True) # e.g. 'Starter', 'Pro'
    slug = models.SlugField(unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Membership Rules (The Limits)
    max_coworkers = models.IntegerField(default=1) # How many users the Boss can add
    max_tables = models.IntegerField(default=10)
    can_use_formulas = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} Plan"

class User(AbstractUser):
    """
    GLOBAL: The identity of the person.
    One account can belong to many different companies.
    """
    email = models.EmailField(unique=True)
    
    # Related names fixed to avoid clashes with default auth
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='global_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='global_user_permissions',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

class Unit(models.Model):
    """
    GLOBAL MODEL: Lives in the 'public' schema.
    Provides standardized units for all tenants.
    """
    CATEGORY_CHOICES = [
        ('currency', 'Currency'),
        ('mass', 'Mass'),
        ('length', 'Length'),
        ('area', 'Area'),
        ('volume', 'Volume'),
        ('time', 'Time'),
        ('percentage', 'Percentage'),
        ('none', 'None/Generic'),
    ]
    
    id = models.CharField(max_length=20, primary_key=True) 
    name = models.CharField(max_length=50)
    label = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    conversion_rate = models.DecimalField(max_digits=20, decimal_places=10, default=1.0)
    is_base_unit = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.label} ({self.category})"

    @staticmethod
    def get_exchange_coefficient(from_unit_id, to_unit_id):
        try:
            # Note: Since this is in public schema, use .objects.all() directly
            u1 = Unit.objects.get(id=from_unit_id)
            u2 = Unit.objects.get(id=to_unit_id)
            if u1.category != u2.category:
                return None
            return u1.conversion_rate / u2.conversion_rate
        except Unit.DoesNotExist:
            return Decimal('1.0')

    @classmethod
    def sync_bnr_rates(cls, main_currency_id='eur'):
        url = "https://www.bnr.ro/nbrfxrates.xml"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200: return False
        except: return False

        tree = ET.fromstring(response.content)
        namespace = {'bnr': 'http://www.bnr.ro/xsd'}
        rates_in_ron = {'ron': Decimal('1.0')}
        cube = tree.find('.//bnr:Cube', namespace)
        for rate in cube.findall('bnr:Rate', namespace):
            currency = rate.get('currency').lower()
            multiplier = Decimal(rate.get('multiplier', '1'))
            value = Decimal(rate.text) / multiplier
            rates_in_ron[currency] = value

        base_rate_in_ron = rates_in_ron.get(main_currency_id.lower(), Decimal('1.0'))
        for code, ron_value in rates_in_ron.items():
            normalized_rate = ron_value / base_rate_in_ron
            currency_labels = {'eur': 'EUR (€)', 'ron': 'RON (lei)', 'usd': 'USD ($)', 'gbp': 'GBP (£)'}
            cls.objects.update_or_create(
                id=code,
                defaults={
                    'name': code.upper(),
                    'label': currency_labels.get(code, code.upper()),
                    'symbol': code.upper() if code not in ['eur', 'ron', 'usd'] else currency_labels[code][-2],
                    'category': 'currency',
                    'conversion_rate': normalized_rate,
                    'is_base_unit': (code == main_currency_id.lower())
                }
            )
        return True