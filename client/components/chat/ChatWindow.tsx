import { useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Message, LoadingMessage } from './Message';
import { ChatInput } from './ChatInput';
import { TypingAnimation } from './TypingAnimation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import ChatBotIcon from '../ChatBotIcon';

interface ChatWindowProps {
  onMobileMenuToggle: () => void;
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
  isKeyboardOpen: boolean;
  closeKeyboard: () => void;
  forceCloseKeyboard: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onMobileMenuToggle,
  onSidebarToggle,
  isSidebarOpen,
  isMobile,
  isKeyboardOpen,
  closeKeyboard,
  forceCloseKeyboard
}) => {
  const { activeChat, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping, scrollToBottom]);

  // Auto-scroll when switching chats
  useEffect(() => {
    if (activeChat) {
      // Force immediate scroll when switching chats
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [activeChat?.id, scrollToBottom]);

  if (!activeChat) {
    return (
      <div
        className="flex-1 flex flex-col h-full overflow-hidden chat-window-container"
        style={{
          backgroundColor: '#202123',
          position: 'relative'
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                forceCloseKeyboard();
                onMobileMenuToggle();
              }}
              className="hover:bg-gray-700 text-white transition-colors duration-200"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4" />
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

        {/* Typing Animation Screen - Scrollable Container */}
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{
            paddingBottom: isMobile ? '140px' : '0' // Space for fixed input on mobile
          }}
        >
          <div className="h-full overflow-y-auto">
            <TypingAnimation isMobile={isMobile} />
          </div>
        </div>

        {/* Input Area - Fixed position on mobile */}
        <ChatInput isKeyboardOpen={isKeyboardOpen} isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden chat-window-container"
      style={{
        backgroundColor: '#202123',
        position: 'relative'
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              forceCloseKeyboard();
              onMobileMenuToggle();
            }}
            className="hover:bg-gray-700 text-white transition-colors duration-200"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-4 h-4" />
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

      {/* Messages - Scrollable Container */}
      <div
        className="flex-1 min-h-0 overflow-hidden"
        style={{
          paddingBottom: isMobile ? '140px' : '0' // Space for fixed input on mobile
        }}
      >
        <ScrollArea className="h-full chat-messages-scroll" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {activeChat?.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isTyping && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed position on mobile */}
      <ChatInput isKeyboardOpen={isKeyboardOpen} isMobile={isMobile} />
    </div>
  );
};
