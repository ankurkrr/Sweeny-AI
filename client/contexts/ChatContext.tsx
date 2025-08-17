import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sendMessageToBot } from '@/lib/n8n-api';
import { createChat, getUserChats, updateChatTimestamp, deleteChat as deleteChatApi, renameChat as renameChatApi, getChatMessages } from '@/lib/chat-api';
import { useMockAuth } from '@/lib/mock-auth-provider';
import { useAuthenticated, useUserData } from '@nhost/react';
import { generateUUID } from '@/lib/uuid';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastMessage?: Date;
  messageCount?: number;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  isTyping: boolean;
  createNewChat: (firstMessage?: string) => Promise<Chat | null>;
  setActiveChat: (chatId: string) => Promise<void>;
  clearActiveChat: () => void;
  sendMessage: (content: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  cleanupEmptyChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Use existing authentication system
  const mockAuth = useMockAuth();
  const nhostUser = useUserData();
  const isAuthenticated = useAuthenticated();

  // Get user from either mock auth or nhost
  const user = mockAuth.isAuthenticated ? mockAuth.user : nhostUser;

  // Helper function to generate smart chat titles from message content
  const generateChatTitle = (message: string): string => {
    if (!message.trim()) return 'New Chat';

    // Remove common chat starters and clean the message
    const cleanMessage = message
      .replace(/^(hi|hello|hey|yo|sup|how are you|what's up)[,!.\s]*/i, '')
      .replace(/^(can you|could you|please|would you)[,\s]*/i, '')
      .trim();

    // Take first few meaningful words (up to 40 characters)
    const words = cleanMessage.split(/\s+/).filter(word => word.length > 0);
    let title = '';

    for (const word of words) {
      if (title.length + word.length + 1 <= 40) {
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }

    // Capitalize first letter and ensure it's not empty
    if (!title) title = message.slice(0, 40);
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  };

  // Function to auto-delete empty chats while keeping at least one
  const cleanupEmptyChats = useCallback(async (silent: boolean = false) => {
    // Don't attempt cleanup if we're in a page unload scenario and there's no network
    if (silent && (!navigator.onLine || document.visibilityState === 'hidden')) {
      console.log('Skipping cleanup - offline or page hidden');
      return;
    }

    const emptyChats = chats.filter(chat =>
      chat.messages.length === 0 &&
      (chat.messageCount === undefined || chat.messageCount === 0)
    );

    // Always keep at least one chat - don't delete if it would leave user with no chats
    if (chats.length - emptyChats.length >= 1) {
      // Delete empty chats (but keep at least one chat overall)
      const chatsToDelete = emptyChats.slice(0, Math.max(0, chats.length - 1));

      for (const chat of chatsToDelete) {
        try {
          await deleteChatApi(chat.id, silent);
          setChats(prev => prev.filter(c => c.id !== chat.id));
        } catch (error) {
          if (silent) {
            console.warn('Failed to cleanup empty chat silently:', error);
          } else {
            console.error('Failed to cleanup empty chat:', error);
          }
        }
      }
    }
  }, [chats]);

  const createNewChat = useCallback(async (firstMessage?: string) => {
    if (!user) return null;

    try {
      const userId = user.id || user.user_id;
      if (!userId) throw new Error('No user ID available');

      console.log('Creating new chat for user:', userId);
      const messageText = typeof firstMessage === 'string' ? firstMessage : 'New Chat';
      const autoTitle = typeof firstMessage === 'string' ? generateChatTitle(firstMessage) : 'New Chat';
      const chatData = await createChat(userId, autoTitle);

      console.log('Chat created successfully:', chatData.id);
      const newChat: Chat = {
        id: chatData.id,
        title: chatData.title || autoTitle,
        messages: [],
        lastMessage: new Date(chatData.created_at),
        messageCount: 0,
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChatState(newChat);
      console.log('New chat set as active:', newChat.id);
      return newChat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  }, [user]);

  const setActiveChat = useCallback(async (chatId: string) => {
    // Cleanup empty chats when switching away from current chat
    if (activeChat && chats.length > 1) {
      // Use setTimeout to allow the cleanup to happen asynchronously with silent mode
      setTimeout(() => cleanupEmptyChats(false), 100);
    }

    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      try {
        // Load messages for this chat
        const messages = await getChatMessages(chatId);
        const formattedMessages: Message[] = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.is_bot ? 'bot' : 'user',
          timestamp: new Date(msg.created_at),
        }));

        setActiveChatState({
          ...chat,
          messages: formattedMessages
        });
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setActiveChatState(chat);
      }
    }
  }, [chats, activeChat, cleanupEmptyChats]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || (!mockAuth.isAuthenticated && !isAuthenticated)) {
      console.error('User not authenticated');
      return;
    }

    let currentChat = activeChat;
    console.log('SendMessage called, activeChat:', activeChat?.id);

    if (!currentChat) {
      console.log('No active chat, creating new chat...');
      // Create new chat with first message
      currentChat = await createNewChat(content);
      if (!currentChat) {
        console.error('Failed to create new chat');
        return;
      }
      console.log('New chat created and set as current:', currentChat.id);
    } else {
      console.log('Using existing chat:', currentChat.id);
    }

    setIsLoading(true);

    // Get user ID
    const userId = user.id || user.user_id;
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    // Generate proper UUID for message ID
    const messageId = generateUUID();
    const userMessage: Message = {
      id: messageId,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    // N8N backend will handle saving both user and bot messages
    // No need to save user message separately here

    // Update the chat with user message
    setChats(prev => prev.map(chat =>
      chat.id === currentChat!.id
        ? {
            ...chat,
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? generateChatTitle(content) : chat.title,
            lastMessage: new Date(),
            messageCount: (chat.messageCount || chat.messages.length) + 1
          }
        : chat
    ));

    setActiveChatState(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      title: prev.messages.length === 0 ? generateChatTitle(content) : prev.title,
      lastMessage: new Date(),
      messageCount: (prev.messageCount || prev.messages.length) + 1
    } : null);

    // Start typing indicator
    setIsTyping(true);
    setIsLoading(false);

    try {
      // Send to n8n backend
      const result = await sendMessageToBot(currentChat.id, content, userId);

      if (result.success) {
        // Generate a fresh UUID for the bot message to avoid conflicts
        const botMessageId = generateUUID();

        const botMessage: Message = {
          id: botMessageId,
          content: result.message.content,
          sender: 'bot',
          timestamp: new Date(result.message.created_at),
        };

        // N8N backend handles saving messages and updating timestamps
        // Update chat timestamp as a separate operation for UI consistency
        try {
          await updateChatTimestamp(currentChat.id);
        } catch (error) {
          console.error('Failed to update chat timestamp:', error);
          // Continue with UI update even if timestamp update fails
        }

        // Update with bot response only (user message already added)
        setChats(prev => prev.map(chat =>
          chat.id === currentChat!.id
            ? {
                ...chat,
                messages: [...chat.messages, botMessage],
                lastMessage: new Date(),
                messageCount: (chat.messageCount || chat.messages.length) + 1
              }
            : chat
        ));

        setActiveChatState(prev => prev ? {
          ...prev,
          messages: [...prev.messages, botMessage],
          lastMessage: new Date(),
          messageCount: (prev.messageCount || prev.messages.length) + 1
        } : null);
      } else {
        // Enhanced error handling for different scenarios
        const errorText = (result as { success: false; error: string }).error || 'Unknown error';
        let userFriendlyMessage = '';

        if (errorText.toLowerCase().includes('you don\'t own this chat')) {
          userFriendlyMessage = "This chat belongs to another user. Please start a new chat to continue.";
        } else if (errorText.toLowerCase().includes('unauthorized') || errorText.toLowerCase().includes('401')) {
          userFriendlyMessage = "You don't have permission to access this chat. Please check your credentials.";
        } else if (errorText.toLowerCase().includes('network') || errorText.toLowerCase().includes('connection') || errorText.toLowerCase().includes('fetch')) {
          userFriendlyMessage = 'Connection failed. Please check your internet connection and try again.';
        } else if (errorText.toLowerCase().includes('timeout')) {
          userFriendlyMessage = 'Request timed out. The server might be busy, please try again in a moment.';
        } else if (errorText.toLowerCase().includes('500') || errorText.toLowerCase().includes('server')) {
          userFriendlyMessage = 'The server is experiencing issues. Please try again later.';
        } else if (errorText.toLowerCase().includes('404')) {
          userFriendlyMessage = 'The chat service is currently unavailable. Please contact support.';
        } else {
          userFriendlyMessage = 'Something went wrong. Please try again.';
        }

        const errorMessage: Message = {
          id: generateUUID(),
          content: userFriendlyMessage,
          sender: 'bot',
          timestamp: new Date(),
        };

        // Update messages with error response only (user message already added)
        setChats(prev => prev.map(chat =>
          chat.id === currentChat!.id
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                lastMessage: new Date()
              }
            : chat
        ));

        setActiveChatState(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage],
          lastMessage: new Date()
        } : null);

        // Log the actual error for debugging
        console.error('Chat API Error:', errorText);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Handle network and other unexpected errors
      let errorMessage = 'Sorry, I encountered a technical issue. Please try again later.';

      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network')) {
          errorMessage = 'Connection failed. Please check your internet connection and try again.';
        } else if (error.message.toLowerCase().includes('timeout')) {
          errorMessage = 'Request timed out. The server might be busy, please try again in a moment.';
        }
      }

      const botErrorMessage: Message = {
        id: generateUUID(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
      };

      // Update messages with error response only (user message already added)
      setChats(prev => prev.map(chat =>
        chat.id === currentChat!.id
          ? {
              ...chat,
              messages: [...chat.messages, botErrorMessage],
              lastMessage: new Date()
            }
          : chat
      ));

      setActiveChatState(prev => prev ? {
        ...prev,
        messages: [...prev.messages, botErrorMessage],
        lastMessage: new Date()
      } : null);
    } finally {
      setIsTyping(false);
    }
  }, [activeChat, createNewChat, user, mockAuth.isAuthenticated, isAuthenticated]);

  // Load user's chats on component mount
  useEffect(() => {
    const loadUserChats = async () => {
      if (!user) return;

      try {
        const userId = user.id || user.user_id;
        if (!userId) return;

        const userChats = await getUserChats(userId);
        const formattedChats: Chat[] = userChats.map(chat => ({
          id: chat.id,
          title: chat.title,
          messages: [], // Messages will be loaded when chat is selected
          lastMessage: new Date(chat.updated_at),
          messageCount: chat.message_count,
        }));

        setChats(formattedChats);
      } catch (error) {
        console.error('Failed to load user chats:', error);
      }
    };

    loadUserChats();
  }, [user]);

  // Cleanup empty chats when user navigates away from the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Attempt cleanup before page unload (may not always complete due to browser limitations)
      cleanupEmptyChats();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden, cleanup empty chats
        cleanupEmptyChats();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupEmptyChats]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChatApi(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChatState(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  }, [activeChat]);

  const renameChat = useCallback(async (chatId: string, newTitle: string) => {
    try {
      const updatedChat = await renameChatApi(chatId, newTitle);
      setChats(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: updatedChat.title, lastMessage: new Date(updatedChat.updated_at) }
          : chat
      ));
      if (activeChat?.id === chatId) {
        setActiveChatState(prev => prev ? { ...prev, title: updatedChat.title } : null);
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  }, [activeChat]);

  const clearActiveChat = useCallback(() => {
    setActiveChatState(null);
  }, []);

  const value = {
    chats,
    activeChat,
    isLoading,
    isTyping,
    createNewChat,
    setActiveChat,
    clearActiveChat,
    sendMessage,
    deleteChat,
    renameChat,
    cleanupEmptyChats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
