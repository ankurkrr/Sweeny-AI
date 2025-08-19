import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useChat } from '@/contexts/ChatContext';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chats, activeChat, setActiveChat } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        navigate('/', { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if chat exists in loaded chats
        const chatExists = chats.find(chat => chat.id === chatId);
        
        if (!chatExists && chats.length > 0) {
          // Chat not found, redirect to dashboard
          setError('Chat not found');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
          return;
        }

        // If chats are still loading, wait a bit
        if (chats.length === 0) {
          // Give some time for chats to load
          setTimeout(() => {
            const stillNoChats = chats.length === 0;
            if (stillNoChats) {
              setError('Unable to load chats');
              navigate('/', { replace: true });
            }
          }, 3000);
          return;
        }

        // Set the active chat if different from current
        if (!activeChat || activeChat.id !== chatId) {
          await setActiveChat(chatId, false); // Don't navigate since we're already on the chat URL
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        setError('Failed to load chat');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, chats, activeChat, setActiveChat, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">{error}</div>
          <div className="text-gray-400">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-center">
          <div className="mx-auto mb-6">
            <div className="w-20 h-20 rounded-lg bg-gray-800 flex items-center justify-center mx-auto loading-container">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F91c20ca81e764ec69cd5de4ed7fc445e%2Ff5e1ea2291e344d6b84127d617e63e9f?format=webp&width=800"
                alt="Sweeny AI Logo"
                className="loading-logo w-16 h-16 rounded-lg object-cover"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Loading Chat</h2>
          <p style={{ color: '#D1D5DB' }}>Please wait while we load your conversation</p>
        </div>
      </div>
    );
  }

  return <ChatLayout />;
}
