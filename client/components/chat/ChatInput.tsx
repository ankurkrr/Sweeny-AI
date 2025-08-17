import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, activeChat, createNewChat } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isComposing && !isSending) {
      setIsSending(true);

      try {
        // Send message (this will create new chat if needed)
        await sendMessage(message.trim());
        setMessage('');

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing && !isSending) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && !isSending) {
      textareaRef.current.focus();
    }
  }, [activeChat, isSending]);

  const isDisabled = !message.trim() || isComposing || isSending;

  return (
    <div
      className="p-4 pt-2 chat-input-container"
      style={{
        backgroundColor: '#202123',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            {/* Main Input Container with 999px border radius */}
            <div
              className={cn(
                "relative flex items-end border transition-all duration-200",
                "focus-within:shadow-lg",
                isSending && "opacity-50"
              )}
              style={{
                backgroundColor: '#2A2B32',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '10px 14px'
              }}
            >
              {/* Attach Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8 mr-2 hover:bg-gray-700 text-white"
                disabled={isSending}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Message Sweeny"
                disabled={isSending}
                className={cn(
                  "flex-1 resize-none bg-transparent border-none outline-none",
                  "placeholder:text-gray-500 text-white",
                  "min-h-[24px] max-h-[120px] overflow-y-auto",
                  isSending && "cursor-not-allowed"
                )}
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
                rows={1}
              />
              
              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                disabled={isDisabled}
                className={cn(
                  "w-8 h-8 ml-2 rounded-full transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  !isDisabled 
                    ? "text-black hover:opacity-80" 
                    : "text-gray-400"
                )}
                style={{ 
                  backgroundColor: isDisabled ? '#565869' : '#FFFFFF'
                }}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
        
        {/* Footer Text */}
        <div className="mt-1 text-center">
          <p
            className="text-xs"
            style={{
              color: '#9CA3AF',
              fontSize: '11px'
            }}
          >
            Sweeny can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};
