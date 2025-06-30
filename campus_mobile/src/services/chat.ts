import API from './api';
import { Chat, ChatMessage } from '../types';

export const chatService = {
  // Get all chats for current user
  async getChats(): Promise<Chat[]> {
    const response = await API.get('chats');
    return response.data;
  },

  // Get chat messages
  async getChatMessages(chatId: number): Promise<ChatMessage[]> {
    const response = await API.get(`chats/${chatId}/messages`);
    return response.data;
  },

  // Send message
  async sendMessage(chatId: number, content: string, messageType: 'text' | 'image' = 'text'): Promise<ChatMessage> {
    const response = await API.post(`chats/${chatId}/messages`, {
      content,
      message_type: messageType
    });
    return response.data;
  },

  // Create or get existing chat with user
  async getOrCreateChat(userId: number): Promise<Chat> {
    const response = await API.post('chats', { participant_id: userId });
    return response.data;
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: number): Promise<void> {
    await API.post(`chats/${chatId}/mark-read`);
  },

  // Delete chat
  async deleteChat(chatId: number): Promise<void> {
    await API.delete(`chats/${chatId}`);
  },

  // Get unread count
  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await API.get('chats/unread-count');
    return response.data;
  }
}; 