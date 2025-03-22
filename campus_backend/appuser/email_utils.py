from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse

def send_verification_email(user):
    """Send email verification link to user"""
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{user.email_verification_token}"
    
    html_message = render_to_string('email/verify_email.html', {
        'user': user,
        'verification_url': verification_url
    })
    plain_message = strip_tags(html_message)
    
    send_mail(
        'Verify your Campus account',
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )

def send_password_reset_email(user):
    """Send password reset link to user"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.password_reset_token}"
    
    html_message = render_to_string('email/reset_password.html', {
        'user': user,
        'reset_url': reset_url
    })
    plain_message = strip_tags(html_message)
    
    send_mail(
        'Reset your Campus password',
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    ) 