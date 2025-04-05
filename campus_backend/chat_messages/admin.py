from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('content', 'sender', 'chat', 'timestamp')
    list_filter = ('chat', 'sender', 'timestamp')
    search_fields = ('content', 'sender__username', 'chat__id')
