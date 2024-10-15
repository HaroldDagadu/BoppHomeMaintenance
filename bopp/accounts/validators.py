# validators.py
from django.core.exceptions import ValidationError
import re

import re
from django.core.exceptions import ValidationError

def validate_phone_number(value):
    # Regular expression for normalized Ghanaian phone numbers (+233 format)
    pattern = re.compile(r'^\+233[25]\d{8}$')

    # Check and normalize phone numbers starting with '05' or '02'
    if value.startswith('05') or value.startswith('02'):
        if len(value) != 10:
            raise ValidationError("Invalid phone number length")
        # Replace the leading '0' with '+233'
        value = '+233' + value[1:]
    
    # Check phone numbers starting with '+233'
    elif value.startswith('+233'):
        if len(value) != 13:
            raise ValidationError("Phone number starting with '+233' must be exactly 13 digits long.")
    
    else:
        # Raise validation error for any other invalid format
        raise ValidationError("Phone number must start with '05', '02', or '+233'.")

    # Validate the normalized phone number against the pattern
    if not pattern.match(value):
        raise ValidationError("Phone number must be in the format '+233241234567' or '+233501234567'.")

    # Return the validated and normalized phone number
    return value


from django.core.exceptions import ValidationError
import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def __init__(self, min_length=8):
        self.min_length = min_length

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                _(f'This password must contain at least {self.min_length} characters.'),
                code='password_too_short',
            )

        # Custom rule: password must contain at least one number
        if not any(char.isdigit() for char in password):
            raise ValidationError(
                _('This password must contain at least one numeric digit.'),
                code='password_no_number',
            )

        # Custom rule: password must contain at least one uppercase letter
        if not any(char.isupper() for char in password):
            raise ValidationError(
                _('This password must contain at least one uppercase letter.'),
                code='password_no_uppercase',
            )

    def get_help_text(self):
        return _(
            f'Your password must contain at least {self.min_length} characters, '
            'including at least one number and one uppercase letter.'
        )
