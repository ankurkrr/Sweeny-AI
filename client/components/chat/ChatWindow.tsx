import { useEffect, useRef } from 'react';
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
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onMobileMenuToggle,
  onSidebarToggle,
  isSidebarOpen,
  isMobile,
  isKeyboardOpen,
  closeKeyboard
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
      <div className="flex-1 flex flex-col h-full overflow-hidden chat-window-container" style={{ backgroundColor: '#202123' }}>
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

        {/* Typing Animation Screen */}
        <TypingAnimation isMobile={isMobile} />

        {/* Input Area */}
        <ChatInput isKeyboardOpen={isKeyboardOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden chat-window-container" style={{ backgroundColor: '#202123' }}>
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

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 chat-messages-scroll">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {activeChat?.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput isKeyboardOpen={isKeyboardOpen} />
    </div>
  );
};
