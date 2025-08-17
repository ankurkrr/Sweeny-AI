import { useEffect, useRef, useState } from 'react';
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

  // Typing animation states
  const [welcomeText, setWelcomeText] = useState('');
  const [helpText, setHelpText] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const welcomeMessage = 'Welcome to Sweeny';
  const helpMessage = 'What can I help with?';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  // Typing animation effect - only run when there's no active chat
  useEffect(() => {
    if (activeChat) return; // Don't run animation if there's an active chat

    // Reset all states
    setWelcomeText('');
    setHelpText('');
    setShowWelcome(true);
    setShowHelp(false);
    setShowCards(false);

    // Type "Welcome to Sweeny"
    let welcomeIndex = 0;
    const welcomeInterval = setInterval(() => {
      if (welcomeIndex < welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, welcomeIndex + 1));
        welcomeIndex++;
      } else {
        clearInterval(welcomeInterval);

        // Wait 800ms then start erasing "Welcome to Sweeny"
        setTimeout(() => {
          let eraseIndex = welcomeMessage.length;
          const eraseInterval = setInterval(() => {
            if (eraseIndex > 0) {
              setWelcomeText(welcomeMessage.slice(0, eraseIndex - 1));
              eraseIndex--;
            } else {
              clearInterval(eraseInterval);

              // Hide welcome text and start typing help text
              setShowWelcome(false);
              setShowHelp(true);

              let helpIndex = 0;
              const helpInterval = setInterval(() => {
                if (helpIndex < helpMessage.length) {
                  setHelpText(helpMessage.slice(0, helpIndex + 1));
                  helpIndex++;
                } else {
                  clearInterval(helpInterval);

                  // Wait 500ms then show suggestion cards
                  setTimeout(() => {
                    setShowCards(true);
                  }, 500);
                }
              }, 50); // Typing speed for help text
            }
          }, 40); // Erasing speed
        }, 800);
      }
    }, 80); // Typing speed for welcome text

    return () => {
      clearInterval(welcomeInterval);
    };
  }, [activeChat]); // Re-run when activeChat changes

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

        {/* Welcome Screen */}
        <div className={`flex-1 flex flex-col ${isMobile ? 'justify-start pt-4 px-4' : 'items-center justify-center p-8'}`}>
          <div className="text-center max-w-2xl w-full">
            {/* Typing Animation */}
            {showWelcome && (
              <h1
                className={`font-bold ${isMobile ? 'mb-2' : 'mb-4'}`}
                style={{
                  color: '#FFFFFF',
                  fontSize: isMobile ? '20px' : '24px',
                  lineHeight: '1.2',
                  fontFamily: 'Playfair Display, serif'
                }}
              >
                {welcomeText}
                {welcomeText.length < welcomeMessage.length && (
                  <span className="animate-pulse">|</span>
                )}
              </h1>
            )}

            {showHelp && (
              <h2
                className={`font-bold ${isMobile ? 'mb-4' : 'mb-8'}`}
                style={{
                  color: '#FFFFFF',
                  fontSize: isMobile ? '18px' : '20px',
                  lineHeight: '1.2'
                }}
              >
                {helpText}
                {helpText.length < helpMessage.length && (
                  <span className="animate-pulse">|</span>
                )}
              </h2>
            )}

            {/* Suggestion Cards - Only show after typing animation */}
            {showCards && (
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-3 mb-4' : 'md:grid-cols-2 gap-4 mb-8'} transition-opacity duration-500`}
                   style={{
                     animation: 'fadeIn 0.5s ease-in-out forwards'
                   }}>
              <div
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors`}
                style={{
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium ${isMobile ? 'mb-1' : 'mb-2'}`}>Create a personal webpage</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>for a social media manager</div>
              </div>

              <div
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors`}
                style={{
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium ${isMobile ? 'mb-1' : 'mb-2'}`}>Help me pick</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>an appropriate car for my needs</div>
              </div>

              <div
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors`}
                style={{
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium ${isMobile ? 'mb-1' : 'mb-2'}`}>Explain nostalgia</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>to a kindergartener</div>
              </div>

              <div
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border cursor-pointer hover:bg-gray-800 transition-colors`}
                style={{
                  backgroundColor: '#2A2B32',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
              >
                <div className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium ${isMobile ? 'mb-1' : 'mb-2'}`}>Design a database schema</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>for an online merch store</div>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput />
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
      <ChatInput />
    </div>
  );
};
