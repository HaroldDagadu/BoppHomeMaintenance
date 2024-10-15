from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from .validators import validate_phone_number, CustomPasswordValidator
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.conf import settings

# Get the custom user model
User = get_user_model()

# Serializer to represent the CustomUser model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('user_id', 'first_name', 'last_name', 'phone_number', 'community', 'house_number')

# Serializer for user registration
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'phone_number', 'community', 'house_number', 'password', 'is_verified')
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only and not returned in the response
        }

    # Validate the phone number format using a custom validator
    def validate_phone_number(self, value):
        return validate_phone_number(value)

    # Password validation using a custom password validator
    def validate_password(self, value):
        # Assuming CustomPasswordValidator checks for password strength
        validator = CustomPasswordValidator(min_length=8)
        validator.validate(value)  # Raises ValidationError if criteria aren't met
        return value

    # Validate the first name (ensuring only alphabetic characters are used)
    def validate_first_name(self, value):
        if not value.isalpha():  # Check if the first name contains only letters
            raise ValidationError("First name should only contain letters.")
        return value

    # Validate the last name (ensuring only alphabetic characters are used)
    def validate_last_name(self, value):
        if not value.isalpha():  # Check if the last name contains only letters
            raise ValidationError("Last name should only contain letters.")
        return value

    # Override the create method to handle password hashing
    def create(self, validated_data):
        # Create the user without saving the password in plain text
        user = CustomUser(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            community=validated_data['community'],
            house_number=validated_data['house_number']
        )
        # Hash the password before saving
        user.set_password(validated_data['password'])
        user.save()
        return user

# Serializer for user login
class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()  # Accept phone number as input
    password = serializers.CharField()  # Accept password as input

    # Validate user credentials
    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')
        user = authenticate(phone_number=phone_number, password=password)  # Authenticate user

        # If authentication fails or user is inactive, raise a validation error
        if user is None or not user.is_active:
            raise serializers.ValidationError("Invalid credentials")

        return user
