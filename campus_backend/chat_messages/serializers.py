from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    
    def get_sender(self, obj):
        if obj.sender:
            return {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'name': obj.sender.name if hasattr(obj.sender, 'name') else obj.sender.username
            }
        return None
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'sender', 'timestamp'] 