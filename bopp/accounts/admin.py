from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

# Custom admin class for managing `CustomUser` in the Django admin interface
class CustomUserAdmin(UserAdmin):
    # Specifies the fields to display in the list view of the Django admin for `CustomUser`
    list_display = (
        'phone_number', 'first_name', 'last_name', 'community', 
        'house_number', 'is_admin', 'is_staff', 'is_superuser', 
        'is_active', 'is_verified'
    )
    
    # Enables search functionality in the Django admin for `CustomUser`
    search_fields = ('phone_number', 'first_name', 'last_name', 'community', 'house_number')
    
    # Marks these fields as read-only in the Django admin
    readonly_fields = ('id',)

    # Enables horizontal filters for these ManyToMany fields in the Django admin
    filter_horizontal = ('groups', 'user_permissions',)
    
    # Adds filtering options in the list view for `CustomUser` based on these fields
    list_filter = ('is_admin', 'is_staff', 'is_superuser', 'is_active', 'is_verified')

    # Defines the layout for displaying `CustomUser` fields in the form view
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),  # Basic fields
        ('Personal info', {'fields': ('first_name', 'last_name', 'community', 'house_number')}),  # Personal details
        ('Permissions', {'fields': ('is_admin', 'is_staff', 'is_superuser', 'is_active', 'is_verified')}),  # Permission fields
        ('Groups', {'fields': ('groups', 'user_permissions')}),  # Groups and permissions
    )
    
    # Defines the layout for adding a new `CustomUser` instance
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'phone_number', 'first_name', 'last_name', 'community', 'house_number', 
                'password1', 'password2', 'is_admin', 'is_staff', 'is_superuser', 
                'is_active', 'is_verified'
            )
        }),
    )

    # Sets the default ordering of `CustomUser` objects by the `id` field
    ordering = ('id',)

# Registers the `CustomUser` model along with its custom admin interface
admin.site.register(CustomUser, CustomUserAdmin)
