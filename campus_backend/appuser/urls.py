from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.get_users, name='get_users'),
    path('users/<int:user_id>/', views.get_user_profile, name='get_user_profile'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('sign-in/', views.sign_in, name='sign_in'),
    path('create-user/', views.create_user, name='create_user'),
    path('verify-email/<str:token>/', views.verify_email, name='verify_email'),
    path('verify-email-by-address/', views.verify_email_by_address, name='verify_email_by_address'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('reset-password/<uuid:token>/', views.reset_password, name='reset_password'),
    path('test-email/', views.test_email, name='test_email'),
    path('debug-users/', views.debug_users, name='debug_users'),  # Temporary debug endpoint
]