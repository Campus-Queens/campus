from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChatListCreateView.as_view(), name='chat-list-create'),
    path('<int:pk>/', views.ChatDetailView.as_view(), name='chat-detail'),
] 