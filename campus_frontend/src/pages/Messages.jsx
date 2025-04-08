import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { WS_URL, API_URL } from '../config';
import API from '../axios';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sellerId = searchParams.get('seller');
  const listingId = searchParams.get('listing');
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const initialChatCreatedRef = useRef(false);
  const maxReconnectAttempts = 5;

  // Effect to get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  // Function to load messages for a conversation
  const loadMessages = async (chatId) => {
    try {
      setIsLoadingMessages(true);
      const response = await API.get(`api/chats/${chatId}/messages/`);

      const currentUser = JSON.parse(localStorage.getItem('user'));

      const formattedMessages = response.data.map(msg => ({
        id: msg.id,
        message: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: msg.sender?.name || msg.sender?.username || 'Unknown',
        isCurrentUser: msg.sender?.id === currentUser?.id
      }));

      setConversations(prev => 
        prev.map(conv => 
          conv.id === chatId 
            ? { ...conv, messages: formattedMessages }
            : conv
        )
      );

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to connect WebSocket
  const connectWebSocket = (chatId) => {
    if (!chatId || isConnecting) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found');
      return;
    }

    try {
      setIsConnecting(true);

      // Close existing socket if any
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      const wsUrl = `${WS_URL}/ws/chat/${chatId}/?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnecting(false);
        reconnectAttemptRef.current = 0;
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed with code:', event.code);
        setIsConnecting(false);

        // Map close codes to user-friendly messages
        const closeMessages = {
          4000: 'Unexpected error occurred',
          4001: 'Authentication token not provided',
          4002: 'Invalid token or user not found',
          4003: 'Chat not found',
          4004: 'Not authorized to access this chat'
        };

        const message = closeMessages[event.code] || 'Connection closed';
        console.log('Close reason:', message);

        // Only attempt to reconnect if we haven't exceeded max attempts,
        // it's still the selected conversation, and it's not an auth error
        if (selectedConversation === chatId && 
            reconnectAttemptRef.current < maxReconnectAttempts &&
            ![4001, 4002, 4004].includes(event.code)) {
          console.log(`Reconnection attempt ${reconnectAttemptRef.current + 1} of ${maxReconnectAttempts}`);
          reconnectAttemptRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket(chatId);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          if (data.type === 'chat_message') {
            const currentUserData = JSON.parse(localStorage.getItem('user'));
            setConversations(prev => 
              prev.map(conv => {
                if (conv.id === chatId) {
                  // Check if message already exists to prevent duplicates
                  if (conv.messages?.some(msg => msg.id === data.message_id)) {
                    return conv;
                  }
                  const newMessage = {
                    id: data.message_id,
                    message: data.message,
                    timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: data.sender?.name || data.sender?.username || 'Unknown',
                    isCurrentUser: currentUserData?.id === data.sender_id
                  };
                  return {
                    ...conv,
                    messages: [...(conv.messages || []), newMessage]
                  };
                }
                return conv;
              })
            );
            // Scroll to bottom after new message
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          } else if (data.type === 'chat_history') {
            const currentUserData = JSON.parse(localStorage.getItem('user'));
            setConversations(prev =>
              prev.map(conv => {
                if (conv.id === chatId) {
                  const formattedMessages = data.messages.map(msg => ({
                    id: msg.message_id,
                    message: msg.message,
                    timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: msg.sender?.name || msg.sender?.username || 'Unknown',
                    isCurrentUser: currentUserData?.id === msg.sender_id
                  }));
                  return {
                    ...conv,
                    messages: formattedMessages
                  };
                }
                return conv;
              })
            );
            // Scroll to bottom after loading history
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setIsConnecting(false);
    }
  };

  // Update the conversation selection handler
  const handleConversationSelect = (chatId) => {
    if (chatId === selectedConversation) return; // Don't reselect if already selected
    setSelectedConversation(chatId);
    loadMessages(chatId);
    reconnectAttemptRef.current = 0; // Reset reconnection attempts
    connectWebSocket(chatId);
  };

  // Update the message sending handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageData = {
      type: 'chat_message',
      message: newMessage.trim()
    };

    try {
      socketRef.current.send(JSON.stringify(messageData));
      console.log('Message sent:', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      initialChatCreatedRef.current = false;
    };
  }, []);

  // Effect to reconnect WebSocket when token changes
  useEffect(() => {
    if (selectedConversation && currentUser) {
      connectWebSocket(selectedConversation);
    }
  }, [currentUser]);

  // Add effect to handle initial chat creation when coming from a listing
  useEffect(() => {
    const createInitialChat = async () => {
      if (listingId && sellerId && !initialChatCreatedRef.current) {
        try {
          initialChatCreatedRef.current = true;
          const response = await API.post('api/chats/', {
            listing: listingId
          });

          const chat = response.data;
          console.log('Created/Retrieved chat:', chat);

          setConversations(prev => {
            if (!prev.some(c => c.id === chat.id)) {
              return [...prev, {
                id: chat.id,
                user: {
                  name: chat.seller_details?.name || chat.seller_details?.username || 'Seller',
                  avatar: chat.seller_details?.profile_picture,
                  lastMessage: '',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                },
                product: {
                  id: chat.listing,
                  title: chat.listing_details?.title || 'Item',
                  price: `$${chat.listing_details?.price || '0'}`,
                  image: chat.listing_details?.image 
                    ? `${API_URL}/media/${chat.listing_details.image.split('/media/')[1]}`
                    : '/placeholder.png',
                  seller: chat.seller_details?.name || chat.seller_details?.username || 'Seller'
                },
                messages: []
              }];
            }
            return prev;
          });
        } catch (error) {
          console.error('Error creating chat:', error);
        }
      }
    };

    createInitialChat();
  }, [listingId, sellerId]);

  // Add effect to load existing chats
  useEffect(() => {
    const loadExistingChats = async () => {
      try {
        console.log('Loading existing chats...');
        const response = await API.get('api/chats/');
        
        const existingChats = response.data;
        console.log('Received chats:', existingChats);
        const currentUser = JSON.parse(localStorage.getItem('user'));

        const formattedChats = existingChats.map(chat => {
          const isCurrentUserSeller = chat.seller === currentUser.id;
          
          return {
            id: chat.id,
            user: {
              name: isCurrentUserSeller
                ? chat.buyer_details?.name || chat.buyer_details?.username || 'Buyer'
                : chat.seller_details?.name || chat.seller_details?.username || 'Seller',
              avatar: isCurrentUserSeller
                ? chat.buyer_details?.profile_picture
                : chat.seller_details?.profile_picture,
              lastMessage: '',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            product: {
              id: chat.listing,
              title: chat.listing_details?.title || 'Item',
              price: `$${chat.listing_details?.price || '0'}`,
              image: chat.listing_details?.image 
                ? `${API_URL}/media/${chat.listing_details.image.split('/media/')[1]}`
                : '/placeholder.png',
              seller: chat.seller_details?.name || chat.seller_details?.username || 'Seller'
            },
            messages: []
          };
        });

        console.log('Formatted chats:', formattedChats);
        setConversations(formattedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadExistingChats();
  }, []);

  // Auto-scroll to bottom when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  // Render empty state when no conversations
  if (!currentConversation && conversations.length === 0 && !listingId) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <div
            onClick={() => navigate('/listings')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors"
          >
            Browse Listings
          </div>
        </div>
      </div>
    );
  }

  // Render loading state when creating new conversation
  if (!currentConversation && listingId) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Creating conversation...</h3>
        </div>
      </div>
    );
  }

  // Render main chat interface
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {conversation.user.avatar ? (
                    <img 
                      src={`${API_URL}${conversation.user.avatar}`} 
                      alt={conversation.user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-600">
                      {conversation.user.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{conversation.user.name}</h3>
                  <p className="text-sm text-gray-500">{conversation.product.title}</p>
                </div>
                <span className="text-xs text-gray-400">{conversation.user.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            {currentConversation && (
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {currentConversation.product.image ? (
                      <img 
                        src={currentConversation.product.image}
                        alt={currentConversation.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-medium text-gray-600">
                        {currentConversation.product.title[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{currentConversation.product.title}</h3>
                    <p className="text-sm text-gray-500">{currentConversation.product.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                currentConversation?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.isCurrentUser
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {!message.isCurrentUser && (
                        <p className="text-xs font-medium mb-1">{message.sender}</p>
                      )}
                      <p>{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isCurrentUser ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 