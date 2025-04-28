from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import AppUser
from .serializers import UserSerializer, UserCreateSerializer
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import uuid
from .email_utils import send_verification_email, send_password_reset_email
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['GET'])
def get_users(request):
    users = AppUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def edit_profile(request):
    data = request.data
    print("🔸 DATA:", data)
    print("🔸 bio:", data.get("bio"))
    print("🔸 name:", data.get("name"))
    print("🔸 user_id:", data.get("user_id"))
    user_id = data.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = AppUser.objects.get(id=user_id)
        user.username = data.get("username", user.username)
        user.name = data.get("name", user.name)
        user.bio = data.get("bio", user.bio)
        user.location = data.get("location", user.location)

        user.instagram = data.get("instagram", user.instagram)
        user.snapchat = data.get("snapchat", user.snapchat)
        user.linkedin = data.get("linkedin", user.linkedin)

        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']

        if 'cover_picture' in request.FILES:
            user.cover_picture = request.FILES['cover_picture']

        user.save()

        return Response({"message": "Profile updated successfully", "user": {
            "name": user.name,
            "email": user.email,
            "bio": user.bio,
            "location": user.location,
            "instagram": user.instagram,
            "snapchat": user.snapchat,
            "linkedin": user.linkedin,
            "profile_picture": user.profile_picture.url if user.profile_picture else None,
            "cover_picture": user.cover_picture.url if user.cover_picture else None,
        }}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sign_in(request):
    data = request.data

    email = data.get("email")
    password = data.get("password")

    print(f"Attempting sign in for email: {email}")  # Debug log

    try:
        user = AppUser.objects.get(email=email)  
        print(f"User found: {user.email}")  # Debug log
        
        if not user.is_email_verified:
            print("Email not verified")  # Debug log
            return Response({"error": "Please verify your email before signing in"}, status=status.HTTP_400_BAD_REQUEST)
            
        if check_password(password, user.password):  
            refresh = RefreshToken.for_user(user)
            response_data = {
                "message": "Welcome Back.",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {  
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "bio": user.bio,
                    "location": user.location,
                    "instagram": user.instagram,
                    "snapchat": user.snapchat,
                    "linkedin": user.linkedin,
                    "profile_picture": user.profile_picture.url if user.profile_picture else None,
                    "cover_picture": user.cover_picture.url if user.cover_picture else None,
        
                }
            }
            print("🟢 Sign-in successful")  # Debug log
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            print("❌ Password incorrect")  # Debug log
            return Response({"error": "Password incorrect please try again."}, status=status.HTTP_400_BAD_REQUEST)
    except AppUser.DoesNotExist:
        print(f"❌ User not found with email: {email}")  # Debug log
        return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_user(request):
    print("\n=== Create User View ===")
    data = request.data.copy()
    print("1. Raw request data:", data)

    # Validate email domain
    email = data.get("email", "")
    print(f"2. Processing email: {email}")
    
    if not email.endswith("@queensu.ca"):
        print("❌ Invalid email domain")
        return Response(
            {"error": "Only @queensu.ca email addresses are allowed"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if AppUser.objects.filter(email=data.get("email")).exists():
        print("❌ Email already registered")
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        print("3. Processing password and username")
        data["password"] = make_password(data["password"])
        data["username"] = data.get("name", "")
        print("4. Data after initial processing:", {
            **data,
            'password': '[HIDDEN]' if 'password' in data else None
        })

        print("5. Creating serializer")
        serializer = UserCreateSerializer(data=data)
        
        print("6. Checking serializer validity")
        if serializer.is_valid():
            print("✅ Serializer is valid")
            print("7. Attempting to save user")
            user = serializer.save()
            print(f"✅ User created successfully: {user.email}")
            
            print("8. Sending verification email")
            try:
                send_verification_email(user)
                print("✅ Verification email sent")
            except Exception as email_error:
                print(f"⚠️ Warning: Could not send verification email: {str(email_error)}")
            
            return Response({
                "message": "Account created successfully! Please check your email to verify your account before signing in.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            print("❌ Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print("❌ Exception in create_user view:", str(e))
        print("Exception type:", type(e).__name__)
        import traceback
        print("Traceback:", traceback.format_exc())
        return Response(
            {"error": f"An error occurred while creating user: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def verify_email(request, token):
    try:
        user = AppUser.objects.get(email_verification_token=token)
        if user.is_email_verified:
            return Response({"message": "Email already verified"}, status=status.HTTP_200_OK)
        
        # Check if token is expired (24 hours)
        if user.email_verification_sent_at and timezone.now() - user.email_verification_sent_at > timedelta(hours=24):
            return Response({"error": "Verification link has expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_email_verified = True
        user.save()
        return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
    except AppUser.DoesNotExist:
        return Response({"error": "Invalid verification token"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')
    try:
        user = AppUser.objects.get(email=email)
        user.password_reset_token = uuid.uuid4()
        user.password_reset_sent_at = timezone.now()
        user.save()
        send_password_reset_email(user)
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
    except AppUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def reset_password(request, token):
    try:
        user = AppUser.objects.get(password_reset_token=token)
        
        # Check if token is expired (1 hour)
        if user.password_reset_sent_at and timezone.now() - user.password_reset_sent_at > timedelta(hours=1):
            return Response({"error": "Password reset link has expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.password = make_password(new_password)
        user.password_reset_token = None
        user.password_reset_sent_at = None
        user.save()
        
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
    except AppUser.DoesNotExist:
        return Response({"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def test_email(request):
    """Test endpoint to send verification email"""
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
            
        user = AppUser.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
            
        send_verification_email(user)
        return Response({'message': 'Test email sent successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def verify_email_by_address(request):
    """Temporary endpoint to verify email directly by email address"""
    email = request.data.get('email')
    try:
        user = AppUser.objects.get(email=email)
        user.is_email_verified = True
        user.save()
        return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
    except AppUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def debug_users(request):
    """Temporary endpoint to debug user accounts"""
    users = AppUser.objects.all()
    user_data = [{
        'id': user.id,
        'email': user.email,
        'is_verified': user.is_email_verified,
        'name': user.name,
        'username': user.username
    } for user in users]
    return Response(user_data)

@api_view(['GET'])
def get_user_profile(request, user_id):
    """Get a user's profile by ID."""
    try:
        user = AppUser.objects.get(id=user_id)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AppUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)