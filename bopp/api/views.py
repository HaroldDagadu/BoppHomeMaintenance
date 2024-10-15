from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import jobSerializer
from django.conf import settings
from rest_framework.pagination import PageNumberPagination


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_job(request):
    """
    API view to create a new job.
    Only accessible to authenticated users.

    Args:
        request: The request object containing job data.

    Returns:
        Response: The response containing the created job data or errors.
    """
    serializer = jobSerializer(
        data=request.data
    )  # Initialize serializer with request data
    if serializer.is_valid():  # Check if the data is valid
        job = serializer.save(
            user=request.user
        )  # Save the job instance with the current user
        return Response(
            jobSerializer(job).data, status=status.HTTP_201_CREATED
        )  # Return created job data
    return Response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST
    )  # Return errors if invalid


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def createcustom_job(request):
    """
    API view to create a custom job.
    Only accessible to authenticated users.

    Args:
        request: The request object containing job data.

    Returns:
        Response: The response containing the created job data or errors.
    """
    serializer = jobSerializer(
        data=request.data
    )  # Initialize serializer with request data
    if serializer.is_valid():  # Check if the data is valid
        job = serializer.save(
            user=request.user
        )  # Save the job instance with the current user
        return Response(
            jobSerializer(job).data, status=status.HTTP_201_CREATED
        )  # Return created job data
    return Response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST
    )  # Return errors if invalid


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated


from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import job
from .serializers import jobSerializer


@api_view(["GET", "POST"])
def jobListstat(request):
    """
    List jobs for the authenticated user or create a new job.
    """

    # Manually authenticate the user using the JWT token from cookies
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(
            request.COOKIES.get("access_token")
        )
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return JsonResponse(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Handle GET request to list jobs
    if request.method == "GET":
        jobs = job.objects.filter(
            user=user, is_deleted=False
        )  # Filter by user and non-deleted jobs
        serializer = jobSerializer(jobs, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    # Handle POST request to create a job
    elif request.method == "POST":
        serializer = jobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)  # Save job with the authenticated user
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class JobPagination(PageNumberPagination):
    """
    Custom pagination class for paginating job results.
    """

    page_size = 10  # Default number of jobs per page
    page_size_query_param = (
        "page_size"  # Allow clients to override page size via query param
    )
    max_page_size = 100  # Maximum allowed jobs per page


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.db.models import Q
from .models import job
from .serializers import jobSerializer


@api_view(["GET"])
def jobListView(request):
    """
    API view to list jobs for the authenticated user with pagination and search.
    """
    jwt_auth = JWTAuthentication()
    try:
        # Authenticate the user by validating the token from the 'access_token' cookie
        validated_token = jwt_auth.get_validated_token(
            request.COOKIES.get("access_token")
        )
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    search_term = request.query_params.get(
        "search", ""
    )  # Get search term from query parameters
    status_filter = request.query_params.get("status", "")  # Get status filter
    queryset = job.objects.filter(user=user, is_deleted=False)

    if status_filter:
        queryset = queryset.filter(status__iexact=status_filter)

    if search_term:  # Filter jobs if search term is provided
        queryset = queryset.filter(
            Q(job_title__icontains=search_term)
            | Q(job_description__icontains=search_term)
            | Q(id__icontains=search_term)
        )

    paginator = JobPagination()
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    serializer = jobSerializer(paginated_queryset, many=True)

    return paginator.get_paginated_response(serializer.data)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework import status
from .serializers import jobSerializer


@api_view(["POST"])
def jobCreateView(request):
    """
    API view to create a job for the authenticated user
    using JWT authentication from the 'access_token' cookie.
    """
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(
            request.COOKIES.get("access_token")
        )
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {
                "isAuthenticated": False,
                "error": "Unauthorized. Token is invalid or missing.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Initialize the serializer with the request data
    serializer = jobSerializer(data=request.data)

    if serializer.is_valid():
        # Save the job with the authenticated user
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import PermissionDenied
from .serializers import jobSerializer
from .models import job


@api_view(["GET"])
def StaffStatView(request):
    """
    API view to list all jobs for staff members.
    Only accessible to users in the 'staff' group.
    """
    jwt_auth = JWTAuthentication()
    try:
        # Extract and validate token from 'access_token' cookie
        validated_token = jwt_auth.get_validated_token(
            request.COOKIES.get("access_token")
        )
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Check if the user belongs to the 'staff' group
    if user.groups.filter(name="staff").exists():
        # Query jobs that are not deleted
        jobs = job.objects.filter(is_deleted=False)
        serializer = jobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        raise PermissionDenied("You do not have permission to view these jobs.")


import requests
import base64
import re
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404  # Import the missing function
from .models import job
from .serializers import jobSerializer
import logging

logger = logging.getLogger(__name__)  # Set up logging


def format_phone_number(phone_number):
    """
    Ensure the phone number is in E.164 format.
    It should start with a '+' and be followed by the country code and the number.

    Args:
        phone_number (str): The phone number to format.

    Raises:
        ValidationError: If the phone number is not in valid E.164 format.

    Returns:
        str: The formatted phone number.
    """
    if phone_number.startswith("0"):
        phone_number = "+233" + phone_number[1:]
    if not phone_number.startswith("+233"):
        raise ValidationError("Invalid phone number format")
    return phone_number  # Return the valid phone number


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
import base64
import requests
import logging

from .models import job
from .serializers import jobSerializer

logger = logging.getLogger(__name__)


@api_view(["PUT", "PATCH"])
def jobUpdateView(request, pk):
    """
    API view to update an existing job.
    Only accessible to authenticated users with valid JWT tokens.
    """
    jwt_auth = JWTAuthentication()
    try:
        # Authenticate the user using the JWT token in cookies
        token = request.COOKIES.get("access_token")
        if not token:
            return Response(
                {"error": "Token not found in cookies."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Fetch the job instance by ID
    job_instance = get_object_or_404(job, pk=pk)

    # Copy request data to modify it before processing
    data = request.data.copy()

    # Set default values for missing fields
    defaults = {
        "job_title": job_instance.job_title or "",
        "job_description": job_instance.job_description or "",
        "user_name": job_instance.user_name or "",
        "user_phone_number": job_instance.user_phone_number or "",
        "user_community": job_instance.user_community or "",
        "user_house_number": job_instance.user_house_number or "",
        "user_idnum": job_instance.user_idnum or "",
        "category": job_instance.category or "Uncategorized",
        "status": job_instance.status or "Pending",
        "work_date": job_instance.work_date or "",
        "assigned_to": job_instance.assigned_to or "",
        "notes": job_instance.notes or "",
        "approved_by": job_instance.approved_by or "",
    }

    # Keep the existing picture if not provided in the request
    data["picture"] = data.get("picture", job_instance.picture)

    # Apply defaults to any missing fields in the request
    for key, value in defaults.items():
        data.setdefault(key, value)

    # Handle job approval or rejection
    if data.get("status") == "Approved":
        data["approved_by"] = (
            f"{user.first_name} {user.last_name}"  # Set the approver's name
        )
        data["is_approved"] = True  # Mark as approved

    if data.get("status") == "Rejected":
        data["notes"] = data.get(
            "notes", job_instance.notes
        )  # Keep existing notes if not provided

    # Validate and update the job using the serializer
    partial = request.method == "PATCH"  # Check if it's a partial update
    serializer = jobSerializer(job_instance, data=data, partial=partial)
    serializer.is_valid(raise_exception=True)
    serializer.save()  # Perform the update

    # Send SMS notification if the status changes to Approved, Completed, or Rejected
    if data["status"] in ["Approved", "Completed", "Rejected"]:
        send_sms_notification(job_instance, data["status"])

    return Response(serializer.data, status=status.HTTP_200_OK)


def send_sms_notification(instance, status):
    """
    Send an SMS notification using Hubtel's API about the job status change.
    """
    url = "https://smsc.hubtel.com/v1/messages/send"
    headers = {
        "Content-Type": "application/json",
    }

    # Use Hubtel credentials from settings
    credentials = f"{settings.HUBTEL_CLIENT_ID}:{settings.HUBTEL_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    headers["Authorization"] = f"Basic {encoded_credentials}"
    sender = f"{settings.SENDER_NICKNAME}"
    # Prepare phone number and user details
    phone_number = (
        instance.phone_number
        if instance.phone_number not in ["X", ""]
        else instance.user_phone_number
    )
    name = instance.name if instance.name not in ["X", ""] else instance.user_name
    community = (
        instance.community
        if instance.community not in ["X", ""]
        else instance.user_community
    )
    house_number = (
        instance.house_number
        if instance.house_number not in ["X", ""]
        else instance.user_house_number
    )

    # Validate and format phone number
    try:
        phone_number = format_phone_number(
            phone_number
        )  # Ensure the phone number is valid
    except ValidationError as e:
        logger.error(f"Invalid phone number: {e}")
        return  # Exit if phone number is invalid

    # Build the SMS content
    message = f"Dear {name}, your job has been {status}. Here are the details:\n"
    details = [
        f"Job ID: {instance.id}",
        f"Description: {instance.job_description}",
        f"Name: {name}",
        f"Community: {community}",
        f"House Number: {house_number}",
        f"Status: {instance.status}",
        f"Category: {instance.category}",
        f"Work Date: {instance.work_date}",
        f"Assigned To: {instance.assigned_to}",
        f"Notes: {instance.notes}",
    ]
    message += "\n".join(detail for detail in details if detail.split(": ")[1] != "X")

    # Prepare the payload for Hubtel API
    payload = {
        "From": sender, 
        "To": phone_number,
        "Content": message,
        "ClientReference": f"Job-{instance.id}",
        "RegisteredDelivery": True,
    }

    # Send the SMS request to Hubtel
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response_data = response.json()

        if response.status_code == 200 and response_data.get("status") == 1:
            logger.info(
                f"SMS sent successfully to {phone_number} for job {instance.id}"
            )
        elif response.status_code == 201:
            logger.info(f"SMS queued successfully for job {instance.id}")
        else:
            logger.error(
                f"Failed to send SMS for job {instance.id}: {response.status_code}, {response_data}"
            )
    except Exception as e:
        logger.error(f"Error sending SMS for job {instance.id}: {e}")


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import job
from .serializers import jobSerializer

from django.contrib.auth.mixins import UserPassesTestMixin


class GroupRequiredMixin(UserPassesTestMixin):
    """
    Mixin to enforce group membership for views.
    """

    def test_func(self):
        """
        Determine if the user passes the test.

        Returns:
            bool: True if the user is authenticated and in the required groups, else False.
        """
        return self.request.user.is_authenticated and (
            self.request.user.is_superuser
            or any(self.request.user.groups.filter(name__in=self.get_required_groups()))
        )

    def get_required_groups(self):
        """
        Get the list of required groups for the view.

        Returns:
            list: A list of required group names.
        """
        return []  # Override this method in subclasses



from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from .models import job
from .serializers import jobSerializer


@api_view(["DELETE"])
def jobDeleteView(request, pk):

    # Authenticate the user using JWT from cookies
    jwt_auth = JWTAuthentication()
    try:
        # Extract and validate the token from cookies
        validated_token = jwt_auth.get_validated_token(
            request.COOKIES.get("access_token")
        )
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Fetch the job instance or return 404 if it does not exist
    job_instance = get_object_or_404(job, pk=pk)

    # Ensure that the user trying to delete the job is the creator
    if job_instance.user != user:
        raise PermissionDenied("You do not have permission to delete this job.")

    # Perform the deletion
    job_instance.delete()

    return Response({"message": "Job deleted successfully."}, status=status.HTTP_200_OK)


from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from .models import job
from .serializers import jobSerializer
from rest_framework.filters import SearchFilter
from django.db.models import Q


# Custom permission class to allow only 'staff' group members
class IsStaff(permissions.BasePermission):
    """
    Custom permission to allow only users in the 'staff' group.
    """

    def has_permission(self, request, view):
        """
        Determine if the user has permission to access the view.

        Args:
            request: The request object.
            view: The view object.

        Returns:
            bool: True if the user is a member of the 'staff' group, else False.
        """
        return request.user and request.user.groups.filter(name="staff").exists()


# Pagination class for paginating job results
class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class for standardizing results set pagination.
    """

    page_size = 25  # Default number of jobs per page
    page_size_query_param = (
        "page_size"  # Allow clients to override page size via query param
    )
    max_page_size = 100  # Maximum allowed jobs per page


@api_view(["GET"])
def StaffjobListView(request):
    """
    API view to list all jobs for staff members.
    Only accessible to users in the 'staff' group.
    Supports search, filtering, and pagination.
    """
    jwt_auth = JWTAuthentication()
    try:
        # Extract and validate token from 'access_token' cookie
        token = request.COOKIES.get("access_token")
        if not token:
            return Response(
                {"error": "Token not found in cookies."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
    except (InvalidToken, TokenError):
        return Response(
            {"error": "Unauthorized. Token is invalid or missing."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Check if the user belongs to the 'staff' group
    if not user.groups.filter(name="staff").exists():
        raise PermissionDenied("You do not have permission to view these jobs.")

    # Get all non-deleted jobs
    queryset = job.objects.filter(is_deleted=False)

    # Get search term from query parameters
    search_term = request.query_params.get("search", None)
    if search_term:
        # Filter jobs by search term
        queryset = queryset.filter(
            Q(job_title__icontains=search_term)
            | Q(user_name__icontains=search_term)
            | Q(id__icontains=search_term)
        )

    # Filter by status and category (if provided in query parameters)
    status_filter = request.query_params.get("status", None)
    category_filter = request.query_params.get("category", None)
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    if category_filter:
        queryset = queryset.filter(category=category_filter)

    # Paginate the results
    paginator = StandardResultsSetPagination()
    paginated_queryset = paginator.paginate_queryset(queryset, request)

    # Serialize the paginated results
    serializer = jobSerializer(paginated_queryset, many=True)

    # Return paginated response
    return paginator.get_paginated_response(serializer.data)
