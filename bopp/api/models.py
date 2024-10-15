from django.db import models
from django.conf import settings
from django.utils.text import slugify
from datetime import datetime

import os

def upload_to(instance, filename):
    """Generate the upload path for job pictures."""
    base, ext = os.path.splitext(filename)
    id_slug = slugify(instance.id)
    return f'job_pictures/{id_slug}{ext}'

class job(models.Model):
    """Model representing a job listing."""
    CATEGORY_CHOICES = [
        ('Electrical', 'Electrical'),
        ('Mechanical', 'Mechanical'),
        ('Civil', 'Civil'),
        ('Uncategorized', 'Uncategorized'),  # Ensure this option is last to prevent empty categories
    ]
        
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Completed', 'Completed'),
        ('Rejected', 'Rejected'),
    ]

    COMMUNITY_CHOICES = (
        ('Ahinkrom', 'Ahinkrom'),
        ('Mill Village', 'Mill Village'),
        ('Edumasi', 'Edumasi'),
    )
    
    # Foreign key to the user model
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    
    # Fields for user details
    name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True,null=True)
    community = models.CharField(max_length=15, choices=COMMUNITY_CHOICES, blank=True, null=True)
    house_number = models.CharField(max_length=20, blank=True, null=True)

    # Fields to store user details, editable=False ensures they are not manually changed
    user_name = models.CharField(max_length=50, unique=False, editable=False, blank=True, null=True)
    user_idnum = models.CharField(max_length=50, unique=False, editable=False, blank=True, null=True)
    user_phone_number = models.CharField(max_length=15, unique=False, editable=False, blank=True, null=True)
    user_community = models.CharField(max_length=15, unique=False, editable=False, blank=True, null=True)
    user_house_number = models.CharField(max_length=20, unique=False, editable=False, blank=True, null=True)

    # Job details
    id = models.CharField(max_length=30, unique=True, editable=False, blank=False, null=False, primary_key=True)
    job_title = models.CharField(max_length=255)
    job_description = models.TextField(blank=True, null=True)
    picture = models.ImageField(upload_to=upload_to, blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='deleted_jobs', null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Uncategorized')
    time_added = models.DateTimeField(auto_now_add=True)
    time_approved = models.DateTimeField(null=True, blank=True)  # Allow null and blank to handle manual updates
    work_date = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    assigned_to = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'job'
        verbose_name_plural = 'jobs'
        ordering = ['-time_added']  # Default ordering by time_added

    def __str__(self):
        return self.job_title
    
          
    def save(self, *args, **kwargs):
        """Override save method to auto-generate fields before saving the instance."""
        if not self.id:
            user_first_initial = self.user.first_name[0].upper() if self.user.first_name else 'X'
            user_last_initial = self.user.last_name[0].upper() if self.user.last_name else 'X'
            timestamp = datetime.now().strftime('%y%m%d%H%M%S')
            self.id = f"{user_first_initial}{user_last_initial}{timestamp}"
        # Fill user details if they are not provided
        self.user_name = self.user_name or f"{self.user.first_name or 'X'} {self.user.last_name or 'X'}"
        self.user_community = self.user_community or (self.user.community or 'X')
        self.user_house_number = self.user_house_number or (self.user.house_number or 'X')
        self.user_phone_number = self.user_phone_number or (self.user.phone_number or 'X')
        self.user_idnum = self.user_idnum or (self.user.user_id or 'X')

        # Fill other details
        self.name = self.name or 'X'
        self.phone_number = self.phone_number or 'X'
        self.community = self.community or 'X'
        self.house_number = self.house_number or 'X'
        super().save(*args, **kwargs)

        
