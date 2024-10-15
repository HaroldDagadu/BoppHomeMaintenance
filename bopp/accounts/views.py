from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework import status, generics, permissions
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import update_session_auth_hash
from .models import OTPResendTracker, CustomUser
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from django.contrib.auth.models import Group
import logging
import jwt

from django.contrib.auth import authenticate


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status



@api_view(['GET'])
def get_routes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
        '/api/register',
        '/api/login',
    ]
    return Response(routes)



from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

@api_view(['POST'])
def login(request):
    phone_number = request.data.get('phone_number')
    password = request.data.get('password')

    user = authenticate(request, phone_number=phone_number, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = JsonResponse({
            'detail': 'Login successful',
            'user': {
                'phone_number': user.phone_number,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': [group.name for group in user.groups.all()]
            }
        })

        # Set the JWT as an HttpOnly cookie
        response.set_cookie(
            'access_token',
            access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            samesite='Lax',  # or 'Strict' if your frontend and backend are on the same domain
            secure=settings.DEBUG is False  # True in production
        )

        return response
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)    
    
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

@api_view(['GET'])
def auth_check(request):
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(request.COOKIES.get('access_token'))
        user = jwt_auth.get_user(validated_token)
        return Response({'isAuthenticated': True, 'user': user.phone_number})
    except (InvalidToken, TokenError):
        return Response({'isAuthenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_user_roles(request):
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(request.COOKIES.get('access_token'))
        user = jwt_auth.get_user(validated_token)
        roles = [group.name for group in user.groups.all()]
        return Response({'roles': roles})
    except (InvalidToken, TokenError):
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def retrieve_user_profile(request):
    jwt_auth = JWTAuthentication()
    try:
        # Fetch and validate token from cookies
        validated_token = jwt_auth.get_validated_token(request.COOKIES.get('access_token'))
        user = jwt_auth.get_user(validated_token)
        
        # Serialize user data
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    except (InvalidToken, TokenError):
        return JsonResponse({'error': 'Unauthorized. Token is invalid or missing.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT', 'PATCH'])
def update_user_profile(request):
    """
    API view to update the authenticated user's profile.
    Supports both PUT (full update) and PATCH (partial update).
    """
    jwt_auth = JWTAuthentication()
    try:
        # Fetch and validate token from cookies
        validated_token = jwt_auth.get_validated_token(request.COOKIES.get('access_token'))
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return JsonResponse({'error': 'Unauthorized. Token is invalid or missing.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Deserialize the input data and update the user
    serializer = UserSerializer(user, data=request.data, partial=(request.method == 'PATCH'))
    
    if serializer.is_valid():
        serializer.save()  # Save updated user information
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import update_session_auth_hash
from rest_framework import status

@api_view(['PUT'])
def change_password(request):
    """
    API view to change the password for the authenticated user.
    """
    jwt_auth = JWTAuthentication()
    try:
        # Authenticate the user by validating the token from the 'access_token' cookie
        validated_token = jwt_auth.get_validated_token(request.COOKIES.get('access_token'))
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response({'error': 'Unauthorized. Token is invalid or missing.'}, status=status.HTTP_401_UNAUTHORIZED)

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # Ensure the old password is correct
    if not user.check_password(old_password):
        return Response({'old_password': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    # Set the new password
    user.set_password(new_password)
    user.save()

    # Update session hash to prevent logout after password change
    update_session_auth_hash(request, user)

    return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


import random
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache  # Using cache to store OTP temporarily
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)




import base64

def send_otp(phone_number, sender_id="MySenderId"):
    """Send the generated OTP via Hubtel SMS"""
    url = "https://api-otp.hubtel.com/otp/send"
    headers = {
        'Content-Type': 'application/json',
    }

    # Basic Authentication (username and password)
    credentials = f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    sender = f"{settings.SENDER_NICKNAME}"

    # Authorization Header
    headers['Authorization'] = f'Basic {encoded_credentials}'

    payload = {
        'senderId': 'sender',
        'phoneNumber': phone_number,  # Full international format phone number
        'countryCode': 'GH',  # Country Code
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        logger.info(f"Hubtel response: {response.text}")  # Log the entire response
        
        if response.status_code == 200:
            data = response.json()
            return data['data']['requestId'], data['data']['prefix']
        else:
            logger.error(f"Failed to send OTP via Hubtel: {response.status_code}, {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error in sending OTP via Hubtel: {e}")
        return None

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

from django.core.cache import cache

@api_view(['POST'])
def verify_num(request):
    """Handle OTP generation and sending for registration"""
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        validated_data = serializer.validated_data
        phone_number = validated_data.get('phone_number')


        # Send OTP via Hubtel
        send_otp_response = send_otp(phone_number)

        if isinstance(send_otp_response, tuple):  # Expecting a tuple of (requestId, prefix)
            request_id, prefix = send_otp_response

            # Ensure request_id is saved in the tracker
            tracker, created = OTPResendTracker.objects.get_or_create(phone_number=phone_number)
            tracker.request_id = request_id  # Store the requestId
            tracker.save()

            # Store OTP and identifiers in cache
            cache.set(f'otp_data_{phone_number}', {'request_id': request_id, 'prefix': prefix, }, timeout=300)

            return Response({
                'message': f'OTP sent to {phone_number}',
                'requestId': request_id,
                'prefix': prefix
            }, status=status.HTTP_200_OK)
        else:
            logger.error("Unexpected response from send_otp: {}".format(send_otp_response))
            return Response({'error': 'Unexpected error occurred. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def verify_otp_view(request):
    if request.method == 'POST':
        try:
            # Parse request body
            data = json.loads(request.body)
            request_id = data.get('requestId')  # Match the expected field names
            prefix = data.get('prefix')
            otp_code = data.get('otp_code')

            # Ensure all required parameters are present
            if not all([request_id, prefix, otp_code]):
                return JsonResponse({'error': 'Missing required parameters'}, status=400)

            # Call the verification function
            is_verified = verify_otp(request_id, prefix, otp_code)
            if is_verified:
                return JsonResponse({'message': 'OTP verified successfully', 'verified': True}, status=200)
            else:
                return JsonResponse({'error': 'Invalid OTP', 'verified': False}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def verify_otp(request_id, prefix, otp_code):
    """Verify the OTP via Hubtel API"""
    url = "https://api-otp.hubtel.com/otp/verify"
    
    # Set headers for the request
    headers = {
        'Content-Type': 'application/json',
    }

    # Basic Authentication (client ID and client secret)
    credentials = f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    # Add Authorization header
    headers['Authorization'] = f'Basic {encoded_credentials}'

    # Payload to send for OTP verification
    payload = {
        'requestId': request_id,
        'prefix': prefix,
        'code': otp_code  # The 4-digit OTP code from the user
    }

    try:
        # Send a POST request to verify the OTP
        response = requests.post(url, json=payload, headers=headers, timeout=10)

        if response.status_code == 200:
            # OTP verified successfully
            logger.info(f"OTP verified successfully for requestId: {request_id}")
            return True
        else:
            # Failed to verify OTP
            logger.error(f"Failed to verify OTP via Hubtel: {response.status_code}, {response.text}")
            return False

    except requests.RequestException as e:
        logger.error(f"Error in verifying OTP via Hubtel: {e}")
        return False


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import requests
import logging
import base64

logger = logging.getLogger(__name__)

# Assume these are defined in your settings or constants
MAX_RESEND_ATTEMPTS = 3
RESEND_TIME_WINDOW = 0  # in minutes

@api_view(['POST'])
def resend_otp(request):
    phone_number = request.data.get('phone_number')

    if not phone_number:
        return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tracker, created = OTPResendTracker.objects.get_or_create(phone_number=phone_number)

        # Check if resend attempts exceeded
        if tracker.attempts >= MAX_RESEND_ATTEMPTS and timezone.now() - tracker.last_attempt < timedelta(minutes=RESEND_TIME_WINDOW):
            return Response({
                'error': f'Maximum resend attempts reached. Please wait {RESEND_TIME_WINDOW} minutes before trying again.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        if not tracker.request_id:
            logger.error(f"RequestId is missing for phone number {phone_number}")
            return Response({'error': 'No valid OTP session found for this phone number. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Hubtel API call to resend the OTP
        url = "https://api-otp.hubtel.com/otp/resend"
        headers = {
            'Content-Type': 'application/json',
        }

        credentials = f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers['Authorization'] = f'Basic {encoded_credentials}'

        payload = {
            'requestId': tracker.request_id  # Use the stored requestId
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            tracker.attempts += 1
            tracker.last_attempt = timezone.now()
            tracker.save()

            return Response({'message': 'OTP resent successfully.'}, status=status.HTTP_200_OK)
        else:
            logger.error(f"Failed to resend OTP via Hubtel: {response.status_code}, {response.text}")
            return Response({'error': 'Failed to resend OTP.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f'Failed to resend OTP: {e}')
        return Response({'error': 'Failed to resend OTP: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import transaction
from django.contrib.auth.models import Group
from .serializers import RegisterSerializer, UserSerializer

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save(is_verified=True)
                group, _ = Group.objects.get_or_create(name='user')
                user.groups.add(group)
                user.save()

                return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error during registration: {str(e)}")  # Add this line for server-side debugging
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)












import base64
import requests
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import OTP  # Assuming the OTP model exists
from django.core.exceptions import ValidationError

User = get_user_model()

def format_phone_number(phone_number):
    # Format phone number to E164 format (example for Ghana)
    if phone_number.startswith('0'):
        phone_number = '+233' + phone_number[1:]
    if not phone_number.startswith('+233'):
        raise ValidationError("Invalid phone number format")
    return phone_number

@api_view(['POST'])
def send_otp_view(request):
    phone_number = request.data.get('phone_number')
    sender = f"{settings.SENDER_NICKNAME}"

    # Check if the phone number is registered in the user model
    try:
        user = User.objects.get(phone_number=phone_number)
    except User.DoesNotExist:
        return Response({"error": "Phone number not registered."}, status=status.HTTP_404_NOT_FOUND)

    # Format phone number
    try:
        formatted_phone_number = format_phone_number(phone_number)
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Hubtel API request to send OTP
    url = "https://api-otp.hubtel.com/otp/send"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + base64.b64encode(
            f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}".encode()).decode(),
    }

    payload = {
        "senderId": "sender",  # Your pre-approved Hubtel Sender ID
        "phoneNumber": formatted_phone_number,
        "countryCode": "GH"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response_data = response.json()

        # Log the response from Hubtel for debugging
        print(f"Hubtel OTP Response: {response_data}")  # Log the response

        # Check if the response status is 200 or 201 and the response code from Hubtel is 0000
        if response.status_code in [200, 201] and response_data.get("code") == "0000":
            # Store the requestId and prefix for OTP verification later
            OTP.objects.create(
                phone_number=formatted_phone_number,
                request_id=response_data['data']['requestId'],
                prefix=response_data['data']['prefix']
            )
            # Log successful OTP send
            print(f"OTP successfully sent. RequestId: {response_data['data']['requestId']}, Prefix: {response_data['data']['prefix']}")
            return Response({
                "message": "OTP sent successfully", 
                "requestId": response_data['data']['requestId'], 
                "prefix": response_data['data']['prefix']
            }, status=status.HTTP_200_OK)
        else:
            # Log failure
            print(f"Failed to send OTP. Status: {response.status_code}, Response: {response_data}")
            return Response({"error": "Failed to send OTP."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error in sending OTP: {e}")  # Log the exception
        return Response({"error": "Error in sending OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def verify_otp_login_view(request):
    phone_number = request.data.get('phone_number')
    otp_code = request.data.get('otp')
    request_id = request.data.get('requestId')
    prefix = request.data.get('prefix')

    # Check if OTP exists
    try:
        otp_instance = OTP.objects.get(phone_number=phone_number, request_id=request_id, prefix=prefix)
    except OTP.DoesNotExist:
        return Response({"error": "Invalid OTP or requestId."}, status=status.HTTP_400_BAD_REQUEST)

    # Hubtel API request to verify OTP
    url = "https://api-otp.hubtel.com/otp/verify"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + base64.b64encode(
            f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}".encode()).decode(),
    }

    payload = {
        "requestId": otp_instance.request_id,
        "prefix": otp_instance.prefix,
        'code': otp_code
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "OTP verification failed"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Error in verifying OTP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import logging




# views.py (continued)
from django.contrib.auth.hashers import make_password

@api_view(['POST'])
def reset_password(request):
    new_password = request.data.get('new_password')
    phone_number = request.data.get('phone_number')

    # Validate new password (can add custom validation logic)
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get the user by phone number
        user = User.objects.get(phone_number=phone_number)

        # Set the new password using Django's password hashing system
        user.password = make_password(new_password)
        user.save()

        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import logout
from rest_framework import status

@api_view(['POST'])
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        response = Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')  # Adjust cookie name if different
        return response



