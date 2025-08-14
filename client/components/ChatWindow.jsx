import { useState, useEffect, useRef } from 'react';
import { useSubscription, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// GraphQL subscription to get messages for the selected chat (from chatbot.messages)
const GET_MESSAGES_SUBSCRIPTION = gql`
  subscription GetMessages($chat_id: uuid!) {
    chatbot_messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
      id
      content
      is_bot
      created_at
    }
  }
`;

// GraphQL mutation for sending messages (insert into chatbot.messages)
const SEND_MESSAGE_MUTATION = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!) {
    insert_chatbot_messages_one(object: {chat_id: $chat_id, content: $content}) {
      id
      content
      is_bot
      created_at
    }
  }
`;

// Individual message component
const Message = ({ message }) => {
  const isBot = message.is_bot;
  
  return (
    <div className={cn(
      "flex w-full mb-6 message-enter",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex max-w-[80%] space-x-3",
        isBot ? "flex-row" : "flex-row-reverse space-x-reverse"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md",
          isBot
            ? "bg-gradient-to-r from-gray-500 to-gray-700"
            : "gradient-primary"
        )}>
          {isBot ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message bubble */}
        <div className="flex flex-col space-y-1">
          <div className={cn(
            "px-5 py-4 rounded-2xl relative chat-bubble shadow-sm",
            isBot
              ? "bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200"
              : "gradient-primary text-white rounded-br-md shadow-md shadow-primary/20"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {message.content}
            </p>
          </div>
          
          {/* Timestamp */}
          <span className={cn(
            "text-xs text-gray-400 px-2 font-medium",
            isBot ? "text-left" : "text-right"
          )}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Message input component
const MessageInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isComposing && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type your message..."
            disabled={disabled || isLoading}
            className={cn(
              "w-full resize-none rounded-xl border-2 border-gray-200 px-5 py-4 pr-14",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "placeholder:text-gray-500 text-sm leading-relaxed transition-all duration-200",
              "min-h-[52px] max-h-[120px] shadow-sm hover:shadow-md",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />
          
          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isComposing || isLoading || disabled}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10",
              "gradient-primary hover:shadow-lg hover:shadow-primary/25 btn-hover",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
      
      {/* Helpful hint */}
      <div className="mt-3 text-xs text-gray-400 text-center font-medium">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

// Main ChatWindow component
export default function ChatWindow({ chatId, chatTitle }) {
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Subscribe to messages for the selected chat
  const { data, loading, error } = useSubscription(GET_MESSAGES_SUBSCRIPTION, {
    variables: { chat_id: chatId },
    skip: !chatId
  });

  // Mutation for sending messages
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => {
      setIsSending(false);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setIsSending(false);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.chatbot_messages]);

  const handleSendMessage = async (content) => {
    if (!chatId || isSending) return;
    setIsSending(true);
    try {
      await sendMessage({
        variables: {
          chat_id: chatId,
          content
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSending(false);
    }
  };

  // Show empty state if no chat is selected
  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl btn-hover">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gradient mb-6 tracking-tight">
              Welcome to Sweeny AI
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Select a chat from the sidebar or create a new one to start your conversation with AI.
            </p>
            <div className="space-y-4 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                <span>Ask questions and get instant responses</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                <span>Your conversations are saved automatically</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full shadow-sm"></div>
                <span>Switch between chats seamlessly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">Error loading messages</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const messages = data?.chatbot_messages || [];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs md:max-w-md">
            {chatTitle || 'Chat'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
          <span className="text-sm text-gray-600 hidden sm:inline">Online</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader2 className="w-10 h-10 spinner text-primary mx-auto mb-3" />
                <p className="text-gray-500 text-base font-medium">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        isLoading={isSending}
        disabled={loading}
      />
    </div>
  );
}
