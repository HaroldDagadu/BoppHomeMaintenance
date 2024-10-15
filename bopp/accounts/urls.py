from django.urls import path
from .views import  get_routes, register,retrieve_user_profile, login, change_password,verify_otp_view,resend_otp,verify_num,get_user_roles
from . import views



urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/roles/', get_user_roles, name='roles'),

    path('api/routes/', get_routes, name='get_routes'),
    path('api/user/profile/', retrieve_user_profile, name='user-profile'),
    path('api/user/profile-update/',views.update_user_profile , name='user-profile'),

    path('api/user/change-password/', change_password, name='change_password'),
    path('api/verify-otp/', verify_otp_view, name='verify_otp'),  # Endpoint to verify OTP and complete registration
    path('api/resend-otp/', resend_otp, name='resend_otp'),  # Endpoint to resend OTP for verification
    path('api/verify-num/', verify_num, name='verify_num'),  # Endpoint to verify OTP and complete registration
    path('api/otp-login/',views.send_otp_view, name='otp_login'),  # Endpoint to verify OTP and complete registration
    path('api/reset-password/',views.reset_password, name='reset_password'),  # Endpoint to verify OTP and complete registration
    path('api/auth/check/', views.auth_check, name='auth-check'),

    # Route for verifying the OTP
    path('api/verify-otp-password-reset/', views.verify_otp_login_view, name='verify_otp_passowrd_reset_view'),

    path('api/logout/', views.logout_view, name='logout'),

]
