from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from .validators import validate_phone_number
import re
from datetime import datetime

# Custom manager for handling CustomUser model creation
class MyAccountManager(BaseUserManager):
    def create_user(self, first_name, last_name, phone_number, community, house_number, password=None):
        # Validate that the necessary fields are provided
        if not first_name:
            raise ValueError('Users must have a first name')
        if not last_name:
            raise ValueError('Users must have a last name')
        if not phone_number:
            raise ValueError('Users must have a phone number')
        if not community:
            raise ValueError('Users must have a community')
        if not house_number:
            raise ValueError('Users must have a house number')

        # Create the user object with the provided details
        user = self.model(
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            community=community,
            house_number=house_number,
        )
        # Set the user's password
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, first_name, last_name, phone_number, community, house_number, password):
        # Create a superuser with all admin permissions
        user = self.create_user(
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            community=community,
            house_number=house_number,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# Custom user model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    COMMUNITY_CHOICES = (
        ('Ahinkrom', 'Ahinkrom'),
        ('Mill Village', 'Mill Village'),
        ('Edumasi', 'Edumasi'),
    )

    # Explicitly define the user_id field
    user_id = models.CharField(max_length=20, unique=True, blank=True, editable=False)

    phone_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[validate_phone_number],  # Use custom phone number validator
        blank=True,
        help_text='Required. Enter a valid Ghanaian phone number.',
        error_messages={
            'unique': "A user with that phone number already exists.",
        }
    )
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    community = models.CharField(max_length=20, choices=COMMUNITY_CHOICES)
    house_number = models.CharField(max_length=20)
    
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
    
    groups = models.ManyToManyField(Group, related_name='account_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='account_set', blank=True)
    
    # Custom authentication fields
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'community', 'house_number']

    # Use the custom account manager
    objects = MyAccountManager()

    def __str__(self):
        return self.phone_number

    # Normalize and validate phone numbers
    def clean_phone_number(self):
        """
        Normalizes and validates the phone number:
        - Replaces the leading '0' with '+233' for numbers starting with '05' or '02'.
        - Ensures the number starts with '+233' and is 13 digits long.
        """
        value = self.phone_number
        
        # Check and normalize phone numbers starting with '05' or '02'
        if value.startswith('05') or value.startswith('02'):
            if len(value) != 10:
                raise ValidationError("Phone number starting with '0' must be exactly 10 digits long.")
            value = '+233' + value[1:]
        
        # Check phone numbers starting with '+233'
        elif value.startswith('+233'):
            if len(value) != 13:
                raise ValidationError("Phone number starting with '+233' must be exactly 13 digits long.")
        
        else:
            raise ValidationError("Phone number must start with '05', '02', or '+233'.")
        
        # Validate against regex pattern
        pattern = re.compile(r'^\+233[25]\d{8}$')
        if not pattern.match(value):
            raise ValidationError("Phone number must be in the format '+233241234567' or '+233501234567'.")
        
        return value

    # Overriding the save method to generate user_id
   
    def generate_user_id(self):
        """Generates a unique user ID based on initials and timestamp."""
        user_first_initial = self.first_name[0].upper() if self.first_name else 'X'
        user_last_initial = self.last_name[0].upper() if self.last_name else 'X'

        # Adding a timestamp in seconds to ensure uniqueness
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        return f"{user_first_initial}{user_last_initial}{timestamp}"
    def save(self, *args, **kwargs):
        """Overridden save method to ensure unique user_id and clean phone_number."""
        if not self.user_id:
            self.user_id = self.generate_user_id()
        
        # Clean the phone number
        self.phone_number = self.clean_phone_number()
        
        super().save(*args, **kwargs)
        
    def has_perm(self, perm, obj=None):
        return self.is_superuser or super().has_perm(perm, obj)

    def has_module_perms(self, app_label):
        return self.is_superuser or super().has_module_perms(app_label)

    class Meta:
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'
        ordering = ['user_id']  # Order by user_id

from django.utils import timezone

# Model to track OTP resend attempts
class OTPResendTracker(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    attempts = models.IntegerField(default=0)
    last_attempt = models.DateTimeField(default=timezone.now)
    request_id = models.CharField(max_length=100, null=True, blank=True)  # Add request_id field
    prefix = models.CharField(max_length=5, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)  
    
    def __str__(self):
        return f"{self.phone_number} - Attempts: {self.attempts}"

from datetime import timedelta

# Model to store OTPs with validation logic
class OTP(models.Model):
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    prefix = models.CharField(max_length=5, null=True, blank=True)
    request_id = models.CharField(max_length=100, null=True, blank=True)

    # Check if the OTP is valid (5 minutes expiration)
    def is_valid(self):
        expiration_time = self.created_at + timedelta(minutes=5)
        return timezone.now() < expiration_time and not self.is_used
