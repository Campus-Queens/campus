import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Message
from chats.models import Chat
from appuser.models import AppUser
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
import logging
import traceback

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token_str):
    try:
        access_token = AccessToken(token_str)
        user_id = access_token.payload.get('user_id')
        if not user_id:
            logger.error("No user_id in token payload")
            return None
        return get_user_model().objects.get(id=user_id)
    except (TokenError, ObjectDoesNotExist) as e:
        logger.error(f"Error getting user from token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in get_user_from_token: {str(e)}")
        logger.error(traceback.format_exc())
        return None

@database_sync_to_async
def get_chat_with_participants(chat_id):
    try:
        return Chat.objects.select_related('buyer', 'seller').get(id=chat_id)
    except Chat.DoesNotExist:
        return None
    except Exception as e:
        logger.error(f"Error getting chat: {str(e)}")
        logger.error(traceback.format_exc())
        return None

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get chat_id from URL route
            self.chat_id = self.scope['url_route']['kwargs']['chat_id']
            self.room_group_name = f'chat_{self.chat_id}'
            logger.info(f"Attempting connection to chat {self.chat_id}")

            # Get token from query string
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')

            if not token:
                logger.error("No token provided in WebSocket connection")
                await self.close(code=4001)
                return

            # Get user from token
            self.user = await get_user_from_token(token)
            if not self.user:
                logger.error("Invalid token or user not found")
                await self.close(code=4002)
                return

            # Check if user has access to this chat
            chat = await get_chat_with_participants(self.chat_id)
            if not chat:
                logger.error(f"Chat not found: {self.chat_id}")
                await self.close(code=4003)
                return

            if self.user.id != chat.buyer.id and self.user.id != chat.seller.id:
                logger.error(f"User {self.user.username} not authorized for chat {self.chat_id}")
                await self.close(code=4004)
                return

            # Add to chat group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(f"✅ WebSocket connection accepted for user: {self.user.username} in chat: {self.chat_id}")

            # Send last 50 messages on connect
            messages = await self.get_chat_history()
            if messages:
                await self.send(text_data=json.dumps({
                    "type": "chat_history",
                    "messages": messages
                }))

        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            logger.error(traceback.format_exc())
            await self.close(code=4000)
            return

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'room_group_name') and hasattr(self, 'channel_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            logger.info(f"🔴 WebSocket disconnected: {self.channel_name} with code {close_code}")
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")
            logger.error(traceback.format_exc())

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            logger.info(f"📨 WebSocket message received: {message}")
            
            # Save message to database
            saved_message = await self.save_message(message)
            
            if saved_message:
                logger.info(f"📤 Sending message to group {self.room_group_name}")
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'message_id': saved_message.id,
                        'sender_id': self.user.id,
                        'sender': {
                            'id': self.user.id,
                            'username': self.user.username,
                            'name': getattr(self.user, 'name', self.user.username)
                        },
                        'timestamp': saved_message.timestamp.isoformat()
                    }
                )
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error in chat_message: {str(e)}")

    @database_sync_to_async
    def get_chat_history(self):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            messages = Message.objects.filter(chat=chat).order_by('-timestamp')[:50]
            return [{
                'message_id': msg.id,
                'message': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'sender': {
                    'id': msg.sender.id,
                    'username': msg.sender.username,
                    'name': getattr(msg.sender, 'name', msg.sender.username)
                },
                'sender_id': msg.sender.id
            } for msg in reversed(messages)]
        except Exception as e:
            logger.error(f"Error getting chat history: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    @database_sync_to_async
    def save_message(self, message):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            saved_message = Message.objects.create(
                content=message,
                chat=chat,
                sender=self.user,
                timestamp=timezone.now()
            )
            logger.info(f"✅ Message saved to database: {saved_message.id}")
            return saved_message
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            logger.error(traceback.format_exc())
            return None
