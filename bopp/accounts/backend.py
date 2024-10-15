from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

# Custom authentication backend for logging in using phone numbers
class PhoneNumberBackend(BaseBackend):
    def authenticate(self, request, phone_number=None, password=None, **kwargs):
        # Get the user model dynamically
        User = get_user_model()
        
        if phone_number:
            # Normalize phone number: replace leading '0' with '+233'
            if phone_number.startswith('0'):
                phone_number = '+233' + phone_number[1:]
            
            # Attempt to retrieve the user by phone number
            try:
                user = User.objects.get(phone_number=phone_number)
                
                # Check if the provided password matches the stored one
                if user.check_password(password):
                    return user
                return None  # Return None if the password is incorrect
            except User.DoesNotExist:
                return None  # Return None if the user does not exist

    def get_user(self, id):
        # Retrieve the user by their primary key (id)
        User = get_user_model()
        try:
            return User.objects.get(pk=id)
        except User.DoesNotExist:
            return None  # Return None if the user does not exist
