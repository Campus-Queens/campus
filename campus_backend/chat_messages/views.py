from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Message
from .serializers import MessageSerializer
from chats.models import Chat
from django.shortcuts import get_object_or_404

# Create your views here.

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_chat_messages(request, chat_id):
    """Get messages for a specific chat."""
    chat = get_object_or_404(Chat, id=chat_id)
    
    # Check if user is participant in chat
    if request.user != chat.buyer and request.user != chat.seller:
        return Response({"error": "Not authorized"}, status=403)
        
    messages = Message.objects.filter(chat=chat).order_by('-timestamp')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)
