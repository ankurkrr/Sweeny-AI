import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Message, LoadingMessage } from './Message';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import ChatBotIcon from '../ChatBotIcon';

interface ChatWindowProps {
  onMobileMenuToggle: () => void;
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onMobileMenuToggle,
  onSidebarToggle,
  isSidebarOpen,
  isMobile
}) => {
  const { activeChat, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#202123' }}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="hover:bg-gray-700 text-white transition-colors duration-200"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1
              className="text-lg font-semibold"
              style={{
                color: '#FFFFFF',
                fontFamily: 'Playfair Display, serif'
              }}
            >
              Sweeny
            </h1>
            <div className="w-10" />
          </div>
        )}

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            {/* Main Greeting */}
            <h1 
              className="font-bold mb-8"
              style={{ 
                color: '#FFFFFF',
                fontSize: '20px',
                lineHeight: '1.2'
              }}
            >
              What can I help with?
            </h1>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div 
                className="p-4 rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ 
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className="text-sm font-medium mb-2">Create a personal webpage</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>for a social media manager</div>
              </div>
              
              <div 
                className="p-4 rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ 
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className="text-sm font-medium mb-2">Help me pick</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>an appropriate car for my needs</div>
              </div>
              
              <div 
                className="p-4 rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ 
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className="text-sm font-medium mb-2">Explain nostalgia</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>to a kindergartener</div>
              </div>
              
              <div 
                className="p-4 rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ 
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className="text-sm font-medium mb-2">Design a database schema</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>for an online merch store</div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <ChatInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#202123' }}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="hover:bg-gray-700 text-white transition-colors duration-200"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1
            className="text-lg font-semibold truncate"
            style={{
              color: '#FFFFFF',
              fontFamily: 'Playfair Display, serif'
            }}
          >
            {activeChat.title}
          </h1>
          <div className="w-10" />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {activeChat?.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput />
    </div>
  );
};
