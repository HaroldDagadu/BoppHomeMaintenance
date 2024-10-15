from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

# Form for creating a new CustomUser instance, inherits from Django's UserCreationForm
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser  # Specifies the model for the form
        fields = ('first_name', 'last_name', 'phone_number', 'community', 'house_number')  # Fields to include
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'first_name'
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'last_name'
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'phone_number'
            'community': forms.Select(attrs={'class': 'form-control'}),  # Custom widget for 'community' (dropdown)
            'house_number': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'house_number'
        }

# Form for updating a CustomUser instance, inherits from Django's UserChangeForm
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser  # Specifies the model for the form
        fields = ('first_name', 'last_name', 'phone_number', 'community', 'house_number')  # Fields to include
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'first_name'
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'last_name'
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'phone_number'
            'community': forms.Select(attrs={'class': 'form-control'}),  # Custom widget for 'community' (dropdown)
            'house_number': forms.TextInput(attrs={'class': 'form-control'}),  # Custom widget for 'house_number'
        }

    # Custom validation method for the 'phone_number' field
    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not phone_number:  # Raise validation error if phone number is missing
            raise forms.ValidationError("Phone number is required.")
        return phone_number  # Return the cleaned phone number

# Simple form for OTP (One-Time Password) verification
class VerificationForm(forms.Form):
    code = forms.CharField(max_length=6)  # Field for the verification code (max 6 characters)

# Form for user login, asking for phone number and password
class LoginForm(forms.Form):
    phone_number = forms.CharField(
        max_length=15, 
        widget=forms.TextInput(attrs={'class': 'form-control'})  # Input widget for 'phone_number'
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'})  # Password input widget for 'password'
    )

# Form for updating user profile information, uses ModelForm to link with CustomUser model
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser  # Specifies the model for the form
        fields = ['first_name', 'last_name', 'phone_number', 'community', 'house_number']  # Fields to include
