from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Chat
from .serializers import ChatSerializer
from listings.models import Listing
from rest_framework import serializers
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return chats where the user is either buyer or seller"""
        user = self.request.user
        return Chat.objects.filter(buyer=user) | Chat.objects.filter(seller=user)

    def create(self, request, *args, **kwargs):
        """Override create to handle existing chats"""
        listing_id = request.data.get('listing')
        
        try:
            listing = Listing.objects.get(id=listing_id)
            
            # Check for existing chat
            existing_chat = Chat.objects.filter(
                listing=listing,
                buyer=request.user,
                seller=listing.seller
            ).first()
            
            if existing_chat:
                serializer = self.get_serializer(existing_chat)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            # If no existing chat, create a new one
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Listing.DoesNotExist:
            return Response(
                {"error": "Invalid listing ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        """Create a new chat, setting the seller from the listing"""
        listing_id = self.request.data.get('listing')
        logger.info(f"Creating chat with data: {self.request.data}")
        
        try:
            listing = Listing.objects.get(id=listing_id)
            logger.info(f"Found listing: {listing}")
            # Set the seller from the listing
            serializer.save(
                buyer=self.request.user,
                seller=listing.seller
            )
        except Listing.DoesNotExist:
            logger.error(f"Listing with ID {listing_id} not found")
            raise serializers.ValidationError("Invalid listing ID")
        except Exception as e:
            logger.error(f"Error creating chat: {str(e)}")
            raise serializers.ValidationError(str(e))

class ChatDetailView(generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only allow access to chats where the user is buyer or seller"""
        user = self.request.user
        return Chat.objects.filter(buyer=user) | Chat.objects.filter(seller=user)
