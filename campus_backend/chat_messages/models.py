from django.db import models
from django.apps import apps

class Message(models.Model):
    content = models.TextField()
    image_url = models.CharField(max_length=255, blank=True, null=True)
    chat = models.ForeignKey("chats.Chat", on_delete=models.CASCADE)  # Use string reference
    sender = models.ForeignKey("appuser.AppUser", on_delete=models.CASCADE, related_name="messages")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content

    class Meta:
        ordering = ['timestamp']


