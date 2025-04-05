from django.urls import path
from . import views

urlpatterns = [
    path('<int:chat_id>/messages/', views.get_chat_messages, name='chat_messages'),
] 